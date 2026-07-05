# ADR-001: Core Technology Stack

**Status:** Accepted · **Date:** 2026-07-05

## Context

The portfolio must demonstrate production AI engineering to hiring managers
while remaining buildable and fully explainable by a single early-career
developer. Every technology must earn its place.

## Decision

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS + Framer Motion, deployed on Vercel.
- **Backend:** Python 3.11 + FastAPI, Dockerized, deployed on Railway (always-on).
- **AI:** OpenAI `gpt-4o-mini` (generation + judging) and `text-embedding-3-small` (embeddings); LangGraph for agent orchestration with the raw OpenAI SDK inside nodes.
- **Storage:** ChromaDB embedded (vector index, rebuilt on deploy — ADR-002); SQLite for chat logs/feedback.

## Rationale

- **Python + FastAPI** is the de-facto pairing of the AI industry; async-native
  for SSE streaming; Pydantic typing and auto-OpenAPI for free.
- **Next.js/TypeScript** is the hiring-market default for product frontends and
  deploys free on Vercel with zero ops.
- **gpt-4o-mini over larger models:** grounded Q&A over a small personal corpus
  is not a frontier-reasoning task. At ~$0.15/M input tokens the entire site
  runs on pocket change, and the eval suite (Phase 5) verifies quality
  empirically rather than assuming bigger = necessary.
- **One LLM provider:** a provider-abstraction layer before the product works
  is speculative complexity. The OpenAI calls are isolated in thin wrapper
  modules, so adding Anthropic later is a contained change.
- **LangGraph, minimal LangChain:** the graph gives an inspectable, testable
  topology (see docs/agent-graph.md); doing prompt construction and API calls
  in plain Python avoids opaque chain abstractions we couldn't defend line by
  line in an interview.

## Alternatives rejected

- **Full-stack TypeScript (Next.js API routes + Vercel AI SDK):** viable, but
  AI/ML hiring evaluates Python fluency; a serverless backend also complicates
  the in-process vector index and session memory.
- **Microservices / Kubernetes:** architecture theater at this scale.
- **Fine-tuning a model on personal data:** wrong tool — facts change (new
  jobs, new projects), fine-tunes are stale the day they finish, and they
  can't cite sources. RAG gives freshness + groundedness + citations.

## Consequences

Two deployables to operate (Vercel + Railway). Python and Node toolchains both
required locally — docker-compose keeps onboarding to one command.
