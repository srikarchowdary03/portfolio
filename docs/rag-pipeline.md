# RAG Pipeline

Retrieval-Augmented Generation grounds every answer in the candidate's real
documents instead of the model's imagination. Two phases: **ingestion**
(offline, at startup) and **retrieval** (per query).

## Ingestion (container startup)

```mermaid
flowchart LR
    MD["/content/*.md<br/>markdown + frontmatter"] --> PARSE["Parse frontmatter<br/>(type, title, tags, date)"]
    PARSE --> CHUNK["Heading-aware chunking<br/>~500 tokens, 50 overlap"]
    CHUNK --> EMBED["OpenAI<br/>text-embedding-3-small"]
    EMBED --> STORE[("ChromaDB collection<br/>vector + text + metadata")]
```

**Chunking strategy.** Split on markdown headings first (a `## Results` section
stays intact), then cap at ~500 tokens with 50-token overlap. Rationale:

- Too small → chunks lose context ("it improved accuracy by 12%" — what did?).
- Too large → retrieval gets blurry (one chunk matches everything weakly) and
  citations become imprecise.
- Heading-aware keeps semantically coherent units together, which also makes
  the citation panel readable to humans.

**Metadata per chunk:** `{doc_type, title, source_file, heading, tags}`.
This enables filtered retrieval — "show his NLP projects" becomes a vector
search *constrained* to `doc_type=project AND tags contains nlp` — and exact
source attribution in the UI.

## Retrieval (per query)

```mermaid
flowchart LR
    Q["User question<br/>(+ session context)"] --> QE["Embed query"]
    QE --> KNN["Chroma top-k=6<br/>cosine similarity<br/>(+ metadata filter)"]
    KNN --> GRADE["LLM relevance grade<br/>keep supported chunks"]
    GRADE --> GEN["Generate with citations<br/>docs passed as &lt;docs&gt; data"]
    GRADE -->|"0 relevant chunks"| IDK["Honest 'I don't have<br/>that information'"]
```

**Why grade after retrieval?** Vector search always returns *something* — the
top-6 nearest neighbors exist even for "what's his favorite pizza?". The
grading step is the hallucination firewall: if nothing retrieved actually
bears on the question, the agent says so instead of improvising.

**Prompt-injection stance.** Retrieved text is wrapped in `<docs>` tags and the
system prompt states it is data, never instructions. The KB is self-authored,
so risk is low today — but the JD Matcher (Phase 7) ingests *visitor-pasted*
text, and this defense is load-bearing there.

## Quality measurement

The eval harness (`backend/evals/`, Phase 5) scores this pipeline on a golden
Q&A dataset: retrieval hit-rate@6 and MRR, plus LLM-judged faithfulness and
answer relevance. Ship gate: hit-rate ≥ 0.9, faithfulness ≥ 0.9.

## Documented upgrade paths (not yet needed — see ADR-002)

- **Hybrid retrieval** (BM25 + vector, reciprocal-rank fusion) when exact-term
  queries ("PyTorch", cert IDs) underperform in evals.
- **Reranking** (cross-encoder) if k must grow beyond ~10.
- **Managed vector DB** (Qdrant/pgvector) when the index outgrows
  rebuild-on-deploy: user-generated data, multi-instance serving, or
  ingestion cost/time that no longer rounds to zero.
