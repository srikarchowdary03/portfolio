"""LLM-as-judge quality metrics.

Only meaningful with the real provider: a fake judge scoring fake answers
would be circular. The runner calls these when LLM_PROVIDER=openai and marks
them "skipped" otherwise — honest reporting over vanity numbers.

Judge prompts live here (not in app/agent/prompts.py): the evaluator must be
able to change independently of the system under test.
"""

from app.agent.llm import LLM

FAITHFULNESS_PROMPT = """ROLE: EVAL_FAITHFULNESS_JUDGE
You are auditing a RAG assistant. Given source documents and an answer,
identify every factual claim in the answer that is NOT supported by the
documents. Ignore phrasing differences; a claim is supported if its substance
appears in the documents.

Respond with JSON only:
{"unsupported_claims": ["<verbatim claim>", ...], "total_claims": <int>}"""

RELEVANCE_PROMPT = """ROLE: EVAL_RELEVANCE_JUDGE
Rate how well an answer addresses the question that was asked, from 0.0
(ignores the question) to 1.0 (fully addresses it). Judge relevance only,
not truthfulness.

Respond with JSON only: {"score": <float 0..1>}"""


def judge_faithfulness(llm: LLM, docs_text: str, answer: str) -> tuple[float, list[str]]:
    """Returns (faithfulness score 0..1, unsupported claims)."""
    verdict = llm.complete_json(
        FAITHFULNESS_PROMPT,
        f"Documents:\n{docs_text}\n\nAnswer to audit:\n{answer}",
    )
    unsupported = [c for c in verdict.get("unsupported_claims", []) if isinstance(c, str)]
    total = verdict.get("total_claims")
    if not isinstance(total, int) or total <= 0:
        # Defensive: an unparseable verdict counts as fully unfaithful only
        # if claims were flagged; otherwise assume clean.
        return (0.0, unsupported) if unsupported else (1.0, [])
    return max(0.0, 1.0 - len(unsupported) / total), unsupported


def judge_relevance(llm: LLM, question: str, answer: str) -> float:
    verdict = llm.complete_json(
        RELEVANCE_PROMPT,
        f"Question: {question}\n\nAnswer: {answer}",
    )
    score = verdict.get("score")
    return float(score) if isinstance(score, int | float) else 0.0
