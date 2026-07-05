"""API routes.

Phase 1 surface: health check + semantic search over the knowledge base.
Later phases add /api/chat (SSE), /api/chat/suggestions, /api/feedback.
"""

import time

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from app.rag.models import SearchResult

router = APIRouter(prefix="/api")


class HealthResponse(BaseModel):
    status: str
    service: str
    index_size: int


class SearchResponse(BaseModel):
    results: list[SearchResult]
    count: int
    latency_ms: int


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
def search(
    request: Request,
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
