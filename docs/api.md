# API Design

FastAPI serves a small, typed surface. Interactive OpenAPI docs live at `/docs`
on the deployed backend — the schema is itself a portfolio artifact.

| Endpoint | Method | Status | Purpose |
|---|---|---|---|
| `/api/healthz` | GET | ✅ Phase 0 | Liveness probe for Railway + uptime monitors |
| `/api/search` | GET | ✅ Phase 1 | Semantic search over the knowledge base |
| `/api/chat` | POST (SSE) | ✅ Phase 2 | The assistant: streamed grounded answers |
| `/api/chat/suggestions` | GET | ✅ Phase 2 | Starter question chips for the chat UI |
| `/api/feedback` | POST | Phase 3 | Thumbs up/down on answers → SQLite |

## `/api/chat` — the core contract

Request:

```json
{ "session_id": "uuid-v4-generated-client-side", "message": "What LLM experience does he have?" }
```

Response: `text/event-stream` (SSE). Event sequence:

```
event: token      data: {"text": "He has"}          ← repeated as tokens generate
event: sources    data: {"sources": [{"n": 1, "title": "RAG Chatbot", "doc_type": "project", "source_file": "projects/rag-chatbot.md", "excerpt": "..."}]}
event: meta       data: {"latency_ms": 1840, "retrieved": 6, "used": 3, "grounded": true}
event: done       data: {}
```

**Why SSE over WebSockets:** token streaming is strictly one-directional
(server → client) after the initial POST. SSE rides on plain HTTP — no
connection upgrade, trivial proxy/CDN behavior, automatic reconnect semantics.
WebSockets would buy bidirectionality nobody uses here.

**Why `sources` as a separate event:** citations are structured data for the
UI (chips → source panel), not prose. Mixing them into the token stream would
force the client to parse markdown for metadata.

## Cross-cutting concerns

- **Validation:** Pydantic models on every request/response; FastAPI rejects
  malformed input before handler code runs. Message length capped (~2,000 chars).
- **Rate limiting:** `slowapi`, per-IP, strictest on `/api/chat` (the only
  endpoint that spends money). 429 with Retry-After on breach.
- **CORS:** allowlist of our origins only; `GET, POST` only.
- **Errors:** structured `{error: {code, message}}`; the SSE stream emits a
  terminal `error` event so the UI never hangs on a dead connection.
