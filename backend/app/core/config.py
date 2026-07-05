"""Application configuration.

All runtime configuration comes from environment variables (12-factor app).
Locally these are read from `backend/.env`; in production they are set in the
hosting platform (Railway). Nothing secret is ever committed to git.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    env: str = "local"
    # Comma-separated list of origins allowed to call this API from a browser.
    allowed_origins: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance so the .env file is parsed once per process."""
    return Settings()
