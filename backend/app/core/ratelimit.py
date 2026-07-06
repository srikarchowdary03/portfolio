"""Per-IP rate limiting (slowapi).

/api/chat is the only endpoint that spends money, so it gets the strictest
limits; /api/search and /api/feedback get looser ones; /api/healthz is
unlimited (uptime monitors ping it constantly).

Limits are read from settings PER REQUEST (via the callables below), so tests
can tighten them with environment overrides without rebuilding the app.

Behind Railway's proxy the client address is in X-Forwarded-For; we trust its
first entry. A determined client could spoof that header to rotate buckets —
acceptable for a portfolio (the OpenAI monthly spend cap is the hard
backstop; see docs/deployment.md).
"""

from fastapi import Request
from slowapi import Limiter

from app.core.config import get_settings


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# headers_enabled -> X-RateLimit-* on responses and Retry-After on 429s.
limiter = Limiter(key_func=client_ip, storage_uri="memory://", headers_enabled=True)


def chat_limits() -> str:
    return get_settings().rate_limit_chat


def search_limits() -> str:
    return get_settings().rate_limit_search


def feedback_limits() -> str:
    return get_settings().rate_limit_feedback
