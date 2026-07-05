"""FastAPI application entrypoint.

Run locally with:  uv run uvicorn app.main:app --reload --port 8000
Interactive API docs are served at /docs (Swagger UI).
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings
from app.rag.embedder import build_embedder
from app.rag.ingest import ingest
from app.rag.retriever import Retriever
from app.rag.store import VectorStore

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Build the RAG index before serving traffic (ADR-002: rebuild on deploy).

    The platform's health check only passes once startup completes, so a
    deploy never serves requests against a half-built index.
    """
    settings = get_settings()
    embedder = build_embedder(settings.embeddings_provider, settings.openai_api_key)
    store = VectorStore()
    ingest(content_dir=settings.content_path, embedder=embedder, store=store)
    app.state.retriever = Retriever(embedder, store)
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="AI Portfolio API",
        description="RAG-powered recruiter assistant API. See /docs for the interactive schema.",
        version="0.2.0",
        lifespan=lifespan,
    )

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
