from fastapi.testclient import TestClient

from app.main import app


def test_healthz_returns_ok_with_populated_index() -> None:
    # Entering the client context runs the lifespan: the knowledge base is
    # ingested (fake embeddings) before the first request is served.
    with TestClient(app) as client:
        response = client.get("/api/healthz")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "portfolio-backend"
    assert body["index_size"] > 0
