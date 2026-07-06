"""FastAPI application entrypoint.

Run locally with:  uv run uvicorn app.main:app --reload --port 8000
Interactive API docs are served at /docs (Swagger UI).
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.agent.graph import AgentRunner
from app.agent.llm import build_llm
from app.api.routes import router
from app.core.config import get_settings
from app.core.ratelimit import limiter
from app.rag.embedder import build_embedder
from app.rag.ingest import ingest
from app.rag.retriever import Retriever
from app.rag.store import VectorStore
from app.services.chatlog import ChatLog
from app.services.sessions import SessionStore

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Build the RAG index and agent before serving traffic (ADR-002).

    The platform's health check only passes once startup completes, so a
    deploy never serves requests against a half-built index.
    """
    settings = get_settings()
    embedder = build_embedder(settings.embeddings_provider, settings.openai_api_key)
    store = VectorStore()
    ingest(content_dir=settings.content_path, embedder=embedder, store=store)
    retriever = Retriever(embedder, store)

    llm = build_llm(settings.llm_provider, settings.openai_api_key, settings.chat_model)
    app.state.retriever = retriever
    app.state.agent = AgentRunner(retriever, llm)
    app.state.sessions = SessionStore()
    app.state.chatlog = ChatLog(settings.chatlog_path)
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="AI Portfolio API",
        description="RAG-powered recruiter assistant API. See /docs for the interactive schema.",
        version="0.2.0",
        lifespan=lifespan,
    )

    # Per-IP rate limiting: /api/chat spends OpenAI tokens, so abuse directly
    # costs money. 429 + Retry-After on breach (app/core/ratelimit.py).
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Browsers block cross-origin requests unless the server opts in. We allow
    # only our own frontend origins — never "*" — so other sites cannot spend
    # our OpenAI budget from their pages.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    app.include_router(router)
    return app


app = create_app()
