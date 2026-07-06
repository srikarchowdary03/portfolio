"""API routes.

Phase 2 surface: health, semantic search, the AI assistant (SSE), starter
suggestions. Phase 3 adds /api/feedback alongside the chat UI.
"""

import asyncio
import json
import time
from collections.abc import AsyncIterator

from fastapi import APIRouter, HTTPException, Query, Request, Response
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.ratelimit import chat_limits, feedback_limits, limiter, search_limits
from app.rag.models import SearchResult

router = APIRouter(prefix="/api")

STREAM_CHUNK_CHARS = 24  # re-chunk size for the verified answer (see /api/chat)

SUGGESTED_QUESTIONS = [
    "Tell me about this candidate.",
    "What LLM experience does he have?",
    "Show me his NLP projects.",
    "Why should I hire him?",
    "What is his work authorization status?",
    "How does the AI behind this portfolio work?",
]


class HealthResponse(BaseModel):
    status: str
    service: str
    index_size: int


class SearchResponse(BaseModel):
    results: list[SearchResult]
    count: int
    latency_ms: int


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=8, max_length=64)
    message: str = Field(min_length=1, max_length=2000)


class FeedbackRequest(BaseModel):
    turn_id: int = Field(ge=1)
    rating: str = Field(pattern="^(up|down)$")
    comment: str | None = Field(default=None, max_length=500)


def _sse(event: str, payload: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(payload)}\n\n"


@router.get("/healthz", response_model=HealthResponse)
def healthz(request: Request) -> HealthResponse:
    """Liveness probe used by the hosting platform and uptime monitors."""
    retriever = getattr(request.app.state, "retriever", None)
    return HealthResponse(
        status="ok",
        service="portfolio-backend",
        index_size=retriever.index_size if retriever else 0,
    )


@router.get("/search", response_model=SearchResponse)
@limiter.limit(search_limits)
def search(
    request: Request,
    response: Response,  # slowapi injects X-RateLimit-*/Retry-After headers here
    q: str = Query(min_length=2, max_length=300, description="Natural-language query"),
    k: int = Query(default=6, ge=1, le=20, description="Number of results"),
    tags: str | None = Query(
        default=None, max_length=100, description="Comma-separated tag filter"
    ),
) -> SearchResponse:
    """Semantic search over the candidate knowledge base."""
    retriever = getattr(request.app.state, "retriever", None)
    if retriever is None or retriever.index_size == 0:
        raise HTTPException(status_code=503, detail="Knowledge base index is not available")

    tag_list = [t.strip().lower() for t in tags.split(",") if t.strip()] if tags else None
    started = time.perf_counter()
    results = retriever.search(q, k=k, tags=tag_list)
    return SearchResponse(
        results=results,
        count=len(results),
        latency_ms=round((time.perf_counter() - started) * 1000),
    )


@router.get("/chat/suggestions")
def chat_suggestions() -> dict:
    """Starter questions for the chat UI."""
    return {"suggestions": SUGGESTED_QUESTIONS}


@router.post("/feedback", status_code=204)
@limiter.limit(feedback_limits)
def feedback(request: Request, response: Response, body: FeedbackRequest) -> None:
    """Thumbs up/down on an answer, keyed by the turn_id from the meta event."""
    request.app.state.chatlog.log_feedback(body.turn_id, body.rating, body.comment)


@router.post("/chat")
@limiter.limit(chat_limits)
async def chat(request: Request, body: ChatRequest) -> StreamingResponse:
    """The AI Recruiter Assistant.

    Verify-then-stream: the agent runs to completion (including the
    groundedness gate) BEFORE any token is emitted, then the verified answer
    streams as SSE. Trades ~1-2s of time-to-first-token for a guarantee that
    no unverified claim ever reaches the client (docs/agent-graph.md).
    """
    agent = getattr(request.app.state, "agent", None)
    if agent is None:
        raise HTTPException(status_code=503, detail="Assistant is not available")
    sessions = request.app.state.sessions
    chatlog = request.app.state.chatlog

    async def event_stream() -> AsyncIterator[str]:
        started = time.perf_counter()
        try:
            history = sessions.history(body.session_id)
            # The agent is synchronous (OpenAI SDK calls); run it off the
            # event loop so one slow generation doesn't block other requests.
            result = await run_in_threadpool(agent.run, body.message, history)
        except Exception:  # noqa: BLE001 — stream must end with an event, never hang
            yield _sse("error", {"message": "Something went wrong. Please try again."})
            return

        # Follow-up suggestions run concurrently with token streaming below,
        # so the extra LLM call adds zero perceived latency. Skipped for
        # refusals/off-topic (nothing grounded to go deeper on).
        followups_task = (
            asyncio.create_task(
                run_in_threadpool(agent.suggest_followups, body.message, result.answer)
            )
            if result.used_count > 0
            else None
        )

        latency_ms = round((time.perf_counter() - started) * 1000)
        sessions.append(body.session_id, "user", body.message)
        sessions.append(body.session_id, "assistant", result.answer)
        turn_id = chatlog.log_turn(
            session_id=body.session_id,
            question=body.message,
            answer=result.answer,
            intent=result.intent,
            grounded=result.grounded,
            retrieved_count=result.retrieved_count,
            used_count=result.used_count,
            chunk_sources=[c.source_file for c in result.citations],
            latency_ms=latency_ms,
        )

        text = result.answer
        for start in range(0, len(text), STREAM_CHUNK_CHARS):
            yield _sse("token", {"text": text[start : start + STREAM_CHUNK_CHARS]})
            await asyncio.sleep(0.012)  # smooth typing cadence for the UI
        yield _sse("sources", {"sources": [c.model_dump() for c in result.citations]})
        yield _sse(
            "meta",
            {
                "turn_id": turn_id,
                "latency_ms": latency_ms,
                "intent": result.intent,
                "grounded": result.grounded,
                "retrieved": result.retrieved_count,
                "used": result.used_count,
            },
        )
        if followups_task is not None:
            try:
                followups = await followups_task
            except Exception:  # noqa: BLE001 — suggestions are optional garnish
                followups = []
            if followups:
                yield _sse("followups", {"questions": followups})
        yield _sse("done", {})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
