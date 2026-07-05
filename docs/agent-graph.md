# Agent Architecture (LangGraph)

The assistant is a small, explicit state machine — every node has a
one-sentence justification, and the whole graph fits in one diagram. That is
deliberate: an agent you can fully explain beats an agent that merely sounds
sophisticated.

```mermaid
flowchart TD
    START([user message]) --> ROUTER["router<br/>classify intent + extract filters<br/>(structured output, 1 cheap call)"]
    ROUTER -->|"off-topic / smalltalk"| SCOPED["scoped reply<br/>polite, no retrieval, no cost"]
    ROUTER -->|"candidate question"| RETRIEVE["retrieve<br/>Chroma top-k=6 (+ tag filter)"]
    RETRIEVE --> GRADE["grade<br/>LLM keeps only relevant chunks"]
    GRADE -->|"0 relevant"| IDK["honest refusal<br/>'I don't have that information'"]
    GRADE -->|"≥1 relevant"| GENERATE["generate<br/>answer with [n] citation markers"]
    GENERATE --> GROUND["groundedness check<br/>every claim supported by a chunk?"]
    GROUND -->|pass| STREAM([stream answer + sources])
    GROUND -->|"fail (once)"| GENERATE
    GROUND -->|"fail twice"| FALLBACK["grounded fallback<br/>quote only what the docs support"]
    FALLBACK --> STREAM
    SCOPED --> STREAM
    IDK --> STREAM
```

## Graph state

```python
class AgentState(TypedDict):
    messages: list[Message]          # trimmed session history (~10 turns)
    intent: Intent                   # question | filter_projects | compare | off_topic
    tag_filter: list[str] | None     # e.g. ["nlp"] from "show his NLP projects"
    retrieved: list[Chunk]
    graded: list[Chunk]
    draft: str
    citations: list[Source]
    grounded: bool
    retry_count: int
```

## Node justifications (the interview answers)

| Node | Why it exists |
|---|---|
| **router** | Not every message needs RAG. "Hi!" shouldn't trigger retrieval; "show NLP projects" should become a *filtered* search. One structured-output call on gpt-4o-mini routes and extracts filters simultaneously. |
| **retrieve** | Semantic search over the KB; metadata filters when the router extracted tags. |
| **grade** | The hallucination firewall — vector search always returns nearest neighbors, even for unanswerable questions. Grading converts "nearest" into "actually relevant, or nothing". |
| **generate** | Answers *only* from graded chunks, with mandatory `[n]` markers mapped to chunk metadata. Refusing to answer beyond the docs is in the system prompt's honesty rules. |
| **groundedness** | Post-hoc judge: is every claim in the draft supported by a retrieved chunk? One retry with a stricter prompt, then a conservative fallback. Bounded loop — no unbounded agent spirals. |

## Why LangGraph (and why this shape)

- **vs. one big prompt:** separating route/retrieve/grade/generate makes each
  step independently testable and evaluable — you can measure retrieval
  quality apart from generation quality.
- **vs. heavyweight chain abstractions:** nodes are plain Python functions
  calling the OpenAI SDK directly; LangGraph contributes only the state
  machine, checkpointing hooks, and a visualizable topology.
- **vs. autonomous tool-loop agents:** a portfolio Q&A bot has a known,
  finite workflow. A conditional graph is the honest fit; an open-ended
  ReAct loop would add latency, cost, and failure modes for zero benefit.

Session memory is per-`session_id` message history (TTL ~30 min, in-process —
right-sized for a single-instance deployment; Redis is the documented upgrade
when horizontal scaling ever matters).

## Verify-then-stream

Groundedness checking conflicts with live token streaming: once a token is on
the wire, it can't be unsaid. The agent therefore runs to completion —
including the groundedness gate and any retry — *before* the first SSE token
is emitted; the verified answer is then re-chunked and streamed for typing-
effect UX. Cost: ~1–2s of time-to-first-token with gpt-4o-mini. Benefit: a
hard guarantee that no unverified claim ever reaches a recruiter's screen.
For a trust-critical, short-answer use case, that trade is clearly right; a
long-form assistant might choose live streaming with post-hoc correction
instead.

## Provider boundary

Like the embedder (`rag/embedder.py`), the LLM sits behind a small interface
(`agent/llm.py`): `OpenAILLM` (gpt-4o-mini, JSON mode for structured calls) in
production, `FakeLLM` for tests and keyless development — scripted responses
for exact node-level unit tests, or rule-based heuristics good enough to run
the entire graph end-to-end with zero API spend.
