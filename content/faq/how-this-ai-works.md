---
type: system
title: "How This AI Assistant Works"
tags: [generative-ai, rag, agents, llm, meta, evaluation]
date: 2026-07-05
links:
  github: https://github.com/srikarchowdary03/portfolio
---

## What this AI is

This assistant is a Retrieval-Augmented Generation (RAG) system that Srikar
designed and built end to end. It does not answer from the language model's
general training data — every answer is assembled from a knowledge base of
his real documents (resume, project documentation, experience, skills, hiring
FAQ, and this very document), retrieved at question time and cited with
numbered source markers. If the documents don't contain an answer, the system
says so instead of guessing. The full source code is public on GitHub.

## The two-mode product design

The portfolio is one product with two front doors: a traditional website and
this conversational assistant. Both are fed by a single directory of markdown
documents — the same file that renders a project page is chunked, embedded,
and indexed for the AI. That single-source-of-truth design means the website
and the assistant can never disagree: updating one markdown file updates both.

## How knowledge gets in: the ingestion pipeline

At every deployment the backend rebuilds its search index from scratch:

1. **Loading** — each markdown document is parsed; YAML frontmatter (document
   type, title, topic tags) becomes searchable metadata.
2. **Chunking** — documents are split on markdown headings so coherent
   sections stay intact, then capped at roughly 500 tokens with a 50-token
   overlap. Each chunk keeps its document title and section heading so
   citations stay human-readable.
3. **Embedding** — every chunk is converted to a 1536-dimensional vector with
   OpenAI's text-embedding-3-small model, which places semantically similar
   text near each other in vector space.
4. **Indexing** — vectors land in ChromaDB running embedded inside the API
   process. Rebuilding on every deploy (a few seconds, under a cent) means
   the index always exactly matches the deployed content — a deliberate
   right-sizing decision over running a separate vector database service.

## How a question gets answered: the agent pipeline

Each message runs through an explicit LangGraph state machine with five
specialized steps:

1. **Router** — a fast LLM call classifies intent (candidate question,
   project filter like "show his NLP projects", comparison, or off-topic) and
   extracts topic tags for filtered retrieval. Small talk gets a polite
   scoped reply with zero retrieval cost.
2. **Retrieve** — the question is embedded and the six most similar chunks
   are fetched from the vector index, optionally filtered by tags.
3. **Grade** — a second LLM call judges each retrieved chunk for actual
   relevance. Vector search always returns *something*, so this step is the
   hallucination firewall: if nothing retrieved truly bears on the question,
   the assistant answers honestly that it doesn't know.
4. **Generate** — gpt-4o-mini writes the answer using only the surviving
   chunks, which are passed as numbered documents; every factual claim must
   carry a [n] citation marker mapping back to a specific chunk.
5. **Groundedness check** — a final LLM call verifies that each claim in the
   draft is supported by the retrieved documents. On failure the system
   regenerates once with stricter instructions, then falls back to
   conservatively quoting the documents. The loop is bounded by design — no
   runaway agent behavior.

## Why answers stream the way they do (verify-then-stream)

A token that has been streamed to the screen cannot be taken back. So the
entire pipeline — including the groundedness check — completes *before* the
first token is shown, and the verified answer is then streamed for a natural
typing feel. This trades one or two seconds of initial wait for a guarantee:
nothing unverified ever reaches the reader.

## Citations and the source panel

Every [n] marker in an answer is clickable and opens the exact passage the
model read when writing that claim, including which file it came from. This
is deliberate transparency: a recruiter can audit any statement back to
Srikar's actual documents.

## Engineering for testability

Both AI dependencies sit behind small provider interfaces: the embedder and
the LLM each have a production OpenAI implementation and a deterministic fake.
The entire system — ingestion, retrieval, the full agent graph, the streaming
API — runs and is tested end to end with zero API calls or keys. That is how
the project's automated test suite runs in CI on every change.

## Memory, logging, and feedback

The assistant remembers the last few turns of a session (in-process, with a
time-to-live) so follow-up questions have context. Every turn is logged —
question, retrieved chunks, latency, groundedness verdict — and readers can
rate answers; both feed the evaluation work below.

## How quality is measured

An evaluation suite (in progress as the next phase) scores the system against
a golden dataset of expected question-answer pairs: retrieval hit-rate and
mean reciprocal rank for the search layer, plus LLM-judged faithfulness and
answer relevance for generation, with honest-refusal checks on out-of-scope
questions. Prompt and chunking changes are validated against these metrics
rather than by eyeballing.

## The technology stack

Python and FastAPI on the backend with LangGraph orchestrating the agent;
OpenAI gpt-4o-mini for generation and judging with text-embedding-3-small for
embeddings; ChromaDB embedded as the vector store; Next.js, TypeScript, and
Tailwind CSS on the frontend with a custom Server-Sent Events streaming
client; Docker for packaging; GitHub Actions for CI; deployed on Vercel
(frontend) and Railway (backend). Every architectural decision — including
what was deliberately rejected — is documented in the repository's
architecture decision records.
