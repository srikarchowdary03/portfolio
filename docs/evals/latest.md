# RAG Evaluation Report

- **Date:** 2026-07-05 23:45 UTC
- **Providers:** embeddings=`fake` llm=`fake` ⚠️ *fake providers: plumbing verification only — semantic scores are not meaningful*
- **Model:** gpt-4o-mini · **k:** 6 · **Dataset:** 32 items (27 answerable, 5 out-of-scope)

## Aggregate metrics

| Metric | Score | What it measures |
|---|---|---|
| Retrieval hit-rate@6 | 81.5% | expected doc in top-k |
| MRR | 0.649 | rank of first expected doc |
| Fact recall | 3.7% | expected facts present in answers |
| Citation presence | 100.0% | answers carrying ≥1 citation |
| Answer rate | 85.2% | answerable items actually answered |
| Refusal correctness | 40.0% | out-of-scope declined |
| Faithfulness (LLM judge) | — (skipped: fake provider) | claims supported by docs |
| Answer relevance (LLM judge) | — (skipped: fake provider) | answers address the question |
| Agent latency p50 / p95 | 5 / 6 ms | full pipeline |

## Per-item results

| id | cat | hit | rr | facts | refusal ok | faithfulness |
|---|---|---|---|---|---|---|
| hire-01 | faq | ✓ | 1.00 | 0% | ✓ | — |
| auth-01 | faq | ✓ | 1.00 | 0% | ✓ | — |
| loc-01 | faq | ✓ | 1.00 | 100% | ✓ | — |
| avail-01 | faq | ✓ | 1.00 | 0% | ✓ | — |
| contact-01 | faq | ✓ | 1.00 | 0% | ✓ | — |
| roles-01 | faq | ✓ | 1.00 | 0% | ✓ | — |
| edu-01 | resume | ✗ | 0.00 | 0% | ✓ | — |
| edu-02 | resume | ✗ | 0.00 | 0% | ✓ | — |
| teach-01 | experience | ✓ | 0.50 | 0% | ✓ | — |
| teach-02 | experience | ✗ | 0.00 | 0% | ✓ | — |
| proj-js-01 | project | ✓ | 1.00 | 0% | ✓ | — |
| proj-js-02 | project | ✓ | 1.00 | 0% | ✓ | — |
| proj-vs-01 | project | ✗ | 0.00 | 0% | ✗ | — |
| proj-vs-02 | project | ✓ | 0.33 | 0% | ✓ | — |
| proj-nlp-01 | project | ✓ | 1.00 | 0% | ✓ | — |
| proj-nlp-02 | project | ✓ | 0.17 | 0% | ✓ | — |
| proj-crc-01 | project | ✓ | 1.00 | 0% | ✓ | — |
| proj-pf-01 | project | ✓ | 1.00 | 0% | ✗ | — |
| skills-01 | skill | ✓ | 0.20 | 0% | ✓ | — |
| skills-02 | skill | ✓ | 0.50 | 0% | ✓ | — |
| skills-03 | skill | ✓ | 0.50 | 0% | ✓ | — |
| ai-01 | system | ✓ | 1.00 | 0% | ✓ | — |
| ai-02 | system | ✓ | 1.00 | 0% | ✗ | — |
| ai-03 | system | ✓ | 1.00 | 0% | ✗ | — |
| filter-01 | project | ✓ | 0.33 | 0% | ✓ | — |
| compare-01 | project | ✓ | 1.00 | 0% | ✓ | — |
| bio-01 | profile | ✗ | 0.00 | 0% | ✓ | — |
| oos-01 | out_of_scope | — | — | — | ✗ | — |
| oos-02 | out_of_scope | — | — | — | ✗ | — |
| oos-03 | out_of_scope | — | — | — | ✓ | — |
| oos-04 | out_of_scope | — | — | — | ✓ | — |
| oos-05 | out_of_scope | — | — | — | ✗ | — |
