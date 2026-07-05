"""API-level tests for the SSE chat endpoint over the real knowledge base."""

import json

from fastapi.testclient import TestClient

from app.main import app

SESSION = "test-session-12345"


def parse_sse(body: str) -> list[tuple[str, dict]]:
    events = []
    for block in body.strip().split("\n\n"):
        lines = dict(line.split(": ", 1) for line in block.splitlines() if ": " in line)
        if "event" in lines:
            events.append((lines["event"], json.loads(lines.get("data", "{}"))))
    return events


def test_chat_streams_tokens_sources_meta_done() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/chat",
            json={"session_id": SESSION, "message": "What LLM experience does he have?"},
        )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    events = parse_sse(response.text)
    names = [name for name, _ in events]

    assert names[0] == "token"
    assert names[-4:] == ["sources", "meta", "followups", "done"]

    followups = next(data for name, data in events if name == "followups")["questions"]
    assert 1 <= len(followups) <= 3 and all(isinstance(q, str) for q in followups)
    answer = "".join(data["text"] for name, data in events if name == "token")
    assert len(answer) > 20

    sources = next(data for name, data in events if name == "sources")["sources"]
    expected_keys = {"n", "title", "doc_type", "source_file", "heading", "excerpt"}
    assert sources and expected_keys <= sources[0].keys()

    meta = next(data for name, data in events if name == "meta")
    assert meta["grounded"] is True and meta["retrieved"] > 0
    assert isinstance(meta["turn_id"], int)


def test_session_memory_accumulates_across_turns() -> None:
    with TestClient(app) as client:
        for message in ("Tell me about this candidate.", "What are his skills?"):
            client.post("/api/chat", json={"session_id": "memory-session-1", "message": message})
        history = app.state.sessions.history("memory-session-1")

    assert len(history) == 4  # 2 user + 2 assistant messages
    assert [m["role"] for m in history] == ["user", "assistant", "user", "assistant"]


def test_chat_validation_rejects_bad_input() -> None:
    with TestClient(app) as client:
        no_message = client.post("/api/chat", json={"session_id": SESSION, "message": ""})
        short_session = client.post("/api/chat", json={"session_id": "abc", "message": "hi"})
        too_long = client.post(
            "/api/chat", json={"session_id": SESSION, "message": "x" * 3000}
        )
    assert no_message.status_code == 422
    assert short_session.status_code == 422
    assert too_long.status_code == 422


def test_feedback_roundtrip() -> None:
    with TestClient(app) as client:
        chat = client.post(
            "/api/chat", json={"session_id": "feedback-sess-1", "message": "His skills?"}
        )
        turn_id = next(
            data for name, data in parse_sse(chat.text) if name == "meta"
        )["turn_id"]

        ok = client.post("/api/feedback", json={"turn_id": turn_id, "rating": "up"})
        bad_rating = client.post("/api/feedback", json={"turn_id": turn_id, "rating": "meh"})

    assert ok.status_code == 204
    assert bad_rating.status_code == 422


def test_suggestions_endpoint() -> None:
    with TestClient(app) as client:
        response = client.get("/api/chat/suggestions")
    assert response.status_code == 200
    suggestions = response.json()["suggestions"]
    assert len(suggestions) >= 4 and all(isinstance(s, str) for s in suggestions)
