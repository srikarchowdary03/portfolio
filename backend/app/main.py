"""FastAPI application entrypoint.

Run locally with:  uv run uvicorn app.main:app --reload --port 8000
Interactive API docs are served at /docs (Swagger UI).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="AI Portfolio API",
        description="RAG-powered recruiter assistant API. See /docs for the interactive schema.",
        version="0.1.0",
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
