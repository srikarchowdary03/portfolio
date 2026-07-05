# ADR-002: Embedded ChromaDB, Rebuilt on Deploy

**Status:** Accepted · **Date:** 2026-07-05

## Context

The RAG knowledge base is small (~50–100 chunks), fully version-controlled in
`/content`, changes only via git commits, and is served by a single backend
instance. We need vector search, but do we need a vector *database service*?

## Decision

Run ChromaDB **embedded** (in-process with FastAPI) and **rebuild the index
from `/content` at container startup** instead of persisting it or running a
managed vector DB.

## Rationale

- **Determinism:** the index always exactly matches the deployed content —
  no sync jobs, no stale-index class of bugs. Content updates ship like code:
  commit → deploy → re-ingest.
- **Cost of rebuild rounds to zero:** ~100 chunks × ~500 tokens through
  `text-embedding-3-small` is a fraction of a cent and a few seconds at boot.
- **Less infrastructure = fewer failure modes:** no network hop to a vector
  store, no credentials, no free-tier eviction surprises, nothing extra to
  monitor.
- **Right-sizing is a signal, not a shortcut:** choosing infrastructure that
  matches the data is precisely what production judgment looks like.

## Migration triggers (when this decision expires)

Move to Qdrant Cloud or Postgres+pgvector when **any** of these become true:

1. The index includes user-generated or runtime-written data (can't rebuild from git).
2. Corpus grows enough that startup ingestion takes minutes or meaningful money (≳50k chunks).
3. Multiple backend instances need a shared index (horizontal scaling).
4. Another service needs to query the index (index becomes a shared resource).

The retriever is behind a small interface (`rag/store.py`), so the swap is
localized by design.

## Consequences

Deploys take a few extra seconds at startup (mitigated by health-check gating).
Index is lost on restart — and rebuilt identically, which is the point.
