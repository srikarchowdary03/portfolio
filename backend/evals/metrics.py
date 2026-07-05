"""Deterministic evaluation metrics.

These run identically under fake and real providers — they measure agent
BEHAVIOR (did it refuse? did it cite? did the right document surface?), not
subjective answer quality. Quality judging lives in judges.py and requires
the real LLM.
"""

from app.agent import prompts
from app.rag.models import SearchResult


def retrieval_hit_and_rr(
    results: list[SearchResult], expected_sources: list[str]
) -> tuple[bool, float]:
    """Hit@k: any expected source in results. RR: 1/rank of the first hit."""
    if not expected_sources:
        return False, 0.0
    for rank, result in enumerate(results, start=1):
        if result.source_file in expected_sources:
            return True, 1.0 / rank
    return False, 0.0


def fact_recall(answer: str, expected_facts: list[str]) -> float | None:
    """Fraction of expected facts present verbatim (case-insensitive)."""
    if not expected_facts:
        return None
    haystack = answer.lower()
    found = sum(1 for fact in expected_facts if fact.lower() in haystack)
    return found / len(expected_facts)


def is_refusal(answer: str) -> bool:
    """Did the agent decline rather than answer from the knowledge base?"""
    return (
        answer == prompts.REFUSAL_TEXT
        or answer == prompts.SCOPED_REPLY_TEXT
        or answer.startswith("I don't have that information")
    )


def mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def percentile(values: list[float], p: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(int(round(p * (len(ordered) - 1))), len(ordered) - 1)
    return ordered[index]
