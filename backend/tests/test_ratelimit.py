"""Rate limiting: 429 + Retry-After on breach; healthz stays unlimited."""

import os

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app


def test_search_rate_limit_trips_and_recovers_config() -> None:
    os.environ["RATE_LIMIT_SEARCH"] = "2/minute"
    get_settings.cache_clear()
    try:
        with TestClient(app) as client:
            # Distinct forwarded IP => fresh bucket, isolated from other tests.
            headers = {"X-Forwarded-For": "203.0.113.7"}
            first = client.get("/api/search?q=kafka", headers=headers)
            second = client.get("/api/search?q=kafka", headers=headers)
            third = client.get("/api/search?q=kafka", headers=headers)

            # Health endpoint is never limited.
            for _ in range(5):
                assert client.get("/api/healthz", headers=headers).status_code == 200
    finally:
        os.environ["RATE_LIMIT_SEARCH"] = "1000/minute"
        get_settings.cache_clear()

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 429
    assert "retry-after" in {k.lower() for k in third.headers}


def test_buckets_are_per_ip() -> None:
    os.environ["RATE_LIMIT_SEARCH"] = "1/minute"
    get_settings.cache_clear()
    try:
        with TestClient(app) as client:
            a1 = client.get("/api/search?q=kafka", headers={"X-Forwarded-For": "203.0.113.8"})
            a2 = client.get("/api/search?q=kafka", headers={"X-Forwarded-For": "203.0.113.8"})
            b1 = client.get("/api/search?q=kafka", headers={"X-Forwarded-For": "203.0.113.9"})
    finally:
        os.environ["RATE_LIMIT_SEARCH"] = "1000/minute"
        get_settings.cache_clear()

    assert a1.status_code == 200
    assert a2.status_code == 429
    assert b1.status_code == 200  # different client, fresh bucket
