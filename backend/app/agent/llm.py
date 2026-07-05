"""LLM providers behind a common interface (mirrors app/rag/embedder.py).

- OpenAILLM: production — gpt-4o-mini, JSON mode for structured calls.
- FakeLLM:   keyless — either scripted (tests inject exact responses) or
  heuristic (rule-based behavior per ROLE marker in the system prompt, so the
  whole agent runs end-to-end without a key or network).
"""

import json
import logging
import re
from typing import Protocol

from openai import OpenAI

from app.agent import prompts

logger = logging.getLogger(__name__)


class LLM(Protocol):
    def complete(self, system: str, messages: list[dict], max_tokens: int = 700) -> str: ...

    def complete_json(self, system: str, user: str) -> dict: ...


class OpenAILLM:
    def __init__(self, api_key: str, model: str = "gpt-4o-mini") -> None:
        self._client = OpenAI(api_key=api_key)
        self._model = model

    def complete(self, system: str, messages: list[dict], max_tokens: int = 700) -> str:
        response = self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": "system", "content": system}, *messages],
            # Slightly loose for generation so prose doesn't read templated;
            # the groundedness gate catches factual drift. JSON calls stay 0.0.
            temperature=0.45,
            max_tokens=max_tokens,
        )
        return (response.choices[0].message.content or "").strip()

    def complete_json(self, system: str, user: str) -> dict:
        response = self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.0,
            max_tokens=400,
            response_format={"type": "json_object"},
        )
        try:
            return json.loads(response.choices[0].message.content or "{}")
        except json.JSONDecodeError:
            logger.warning("LLM returned invalid JSON despite JSON mode")
            return {}


class FakeLLM:
    """Deterministic stand-in.

    Scripted mode: pass `scripted=[...]` and each call pops the next response
    (dict for complete_json, str for complete) — for exact unit-test control.
    Heuristic mode (default): rule-based responses dispatched on the ROLE
    marker, good enough to exercise every graph path with real KB content.
    """

    def __init__(self, scripted: list | None = None) -> None:
        self._scripted = list(scripted) if scripted else None

    def complete(self, system: str, messages: list[dict], max_tokens: int = 700) -> str:
        if self._scripted is not None:
            return self._scripted.pop(0)
        # Generation: quote the numbered blocks INSIDE <docs> only — the
        # system prompt's own rules also contain "[1]"-style text and even
        # the literal strings "<docs> and </docs>", so anchor on the newline
        # that only the real block has after its opening tag (greedy to the
        # final closing tag).
        docs_section = re.search(r"<docs>\n(.*)\n</docs>", system, re.DOTALL)
        if not docs_section:
            return "I can help with questions about the candidate."
        docs = re.findall(
            r"\[(\d+)\][^\n]*\n(.*?)(?=\n\[\d+\]|\Z)", docs_section.group(1), re.DOTALL
        )
        parts = []
        for n, text in docs[:3]:
            # Chunk text starts with the title line the chunker prefixed;
            # quote the first content line after it (fall back to the title).
            lines = [line.strip() for line in text.strip().splitlines() if line.strip()]
            if not lines:
                continue
            quote = lines[1] if len(lines) > 1 else lines[0]
            parts.append(f"{quote[:160]} [{n}]")
        if not parts:
            return "I can help with questions about the candidate."
        return "Based on the candidate's documents: " + " ".join(parts)

    def complete_json(self, system: str, user: str) -> dict:
        if self._scripted is not None:
            return self._scripted.pop(0)
        if "ROLE: INTENT_ROUTER" in system:
            return self._route(user)
        if "ROLE: RELEVANCE_GRADER" in system:
            return self._grade(user)
        if "ROLE: GROUNDEDNESS_JUDGE" in system:
            return {"grounded": True, "unsupported_claims": []}
        return {}

    @staticmethod
    def _route(user: str) -> dict:
        # Classify only the latest message — the prompt also carries session
        # history, whose words must not leak into this turn's intent.
        latest = user.split("Latest message:")[-1]
        # Token match, not substring match — "the weather" contains "he ".
        words = set(re.findall(r"[a-z-]+", latest.lower()))
        known_tags = re.findall(r"[a-z-]+", prompts.ROUTER_PROMPT.split("Known topic tags:")[1])
        tags = [t for t in known_tags if len(t) > 2 and t in words]
        candidate_tokens = {
            "he", "his", "him", "candidate", "srikar", "project", "projects",
            "skill", "skills", "experience", "hire", "resume", "llm", "llms",
            "work", "role", "roles", "education", "built",
        }
        if words & candidate_tokens:
            intent = "filter_projects" if "project" in words or "projects" in words else "question"
            return {"intent": intent if tags or intent == "question" else "question", "tags": tags}
        return {"intent": "off_topic", "tags": []}

    @staticmethod
    def _grade(user: str) -> dict:
        question_match = re.search(r"Question: (.*)", user)
        question = question_match.group(1) if question_match else user
        question_words = set(re.findall(r"[a-z]{3,}", question.lower()))
        relevant = []
        for n, text in re.findall(r"\[(\d+)\][^\n]*\n(.*?)(?=\n\[\d+\]|\Z)", user, re.DOTALL):
            chunk_words = set(re.findall(r"[a-z]{3,}", text.lower()))
            if question_words & chunk_words:
                relevant.append(int(n))
        return {"relevant": relevant}


def build_llm(provider: str, api_key: str | None, model: str) -> LLM:
    if provider == "openai":
        if not api_key:
            raise ValueError(
                "LLM_PROVIDER=openai requires OPENAI_API_KEY. "
                "Set the key, or use LLM_PROVIDER=fake for keyless development."
            )
        return OpenAILLM(api_key=api_key, model=model)
    if provider == "fake":
        return FakeLLM()
    raise ValueError(f"Unknown LLM provider: {provider!r} (expected 'openai' or 'fake')")
