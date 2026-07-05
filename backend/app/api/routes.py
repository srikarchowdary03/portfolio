"""API routes.

Phase 0 exposes only the health check. Later phases add:
  /api/chat (SSE), /api/chat/suggestions, /api/search, /api/feedback.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api")


class HealthResponse(BaseModel):
    status: str
    service: str


@router.get("/healthz", response_model=HealthResponse)
def healthz() -> HealthResponse:
    """Liveness probe used by the hosting platform and uptime monitors."""
    return HealthResponse(status="ok", service="portfolio-backend")
