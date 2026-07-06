"""Application configuration.

All runtime configuration comes from environment variables (12-factor app).
Locally these are read from `backend/.env`; in production they are set in the
hosting platform (Railway). Nothing secret is ever committed to git.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    env: str = "local"
    # Comma-separated list of origins allowed to call this API from a browser.
    allowed_origins: str = "http://localhost:3000"

    # --- RAG / AI ---
    openai_api_key: str | None = None
    # "openai" in production; "fake" runs the full pipeline deterministically
    # without API calls (tests, keyless local dev).
    embeddings_provider: str = "openai"
    llm_provider: str = "openai"
    chat_model: str = "gpt-4o-mini"
    # Local writable state (SQLite chat log). Gitignored; Docker uses /app/data.
    data_dir: str = "data"

    # --- Rate limits (per client IP; slowapi format "N/period[;N/period]") ---
    # Chat is the only money-spending endpoint -> strictest.
    rate_limit_chat: str = "10/minute;60/day"
    rate_limit_search: str = "30/minute"
    rate_limit_feedback: str = "20/minute"
    # Path to the knowledge base. Local default assumes the repo layout
    # (backend/ next to content/); Docker sets CONTENT_DIR=/app/content.
    content_dir: str = "../content"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def content_path(self) -> Path:
        return Path(self.content_dir).resolve()

    @property
    def chatlog_path(self) -> Path:
        return Path(self.data_dir).resolve() / "chatlog.db"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance so the .env file is parsed once per process."""
    return Settings()
