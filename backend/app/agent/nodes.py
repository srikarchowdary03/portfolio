"""Agent graph nodes — plain functions with explicit dependencies.

Each node takes (state, deps) and returns only the state fields it updates,
which keeps every node independently unit-testable (see docs/agent-graph.md
for the one-sentence justification of each node's existence).
"""

import logging
import re

from app.agent import prompts
from app.agent.llm import LLM
from app.agent.state import AgentState, Citation
from app.rag.models import SearchResult
from app.rag.retriever import Retriever

logger = logging.getLogger(__name__)

TOP_K = 6
MAX_RETRIES = 1


def format_docs(chunks: list[SearchResult]) -> str:
    """Number chunks for the LLM; the numbers become citation markers."""
    blocks = []
    for n, chunk in enumerate(chunks, start=1):
        header = f"[{n}] {chunk.title}" + (f" — {chunk.heading}" if chunk.heading else "")
        blocks.append(f"{header}\n{chunk.text}")
    return "\n\n".join(blocks)


def _history_text(history: list[dict]) -> str:
    if not history:
        return "(no prior conversation)"
    return "\n".join(f"{m['role']}: {m['content'][:300]}" for m in history)


def route(state: AgentState, llm: LLM) -> AgentState:
    result = llm.complete_json(
        prompts.ROUTER_PROMPT,
        f"Prior conversation:\n{_history_text(state.get('history', []))}\n\n"
        f"Latest message: {state['question']}",
    )
    intent = result.get("intent", "question")
    if intent not in {"question", "filter_projects", "compare", "off_topic"}:
        intent = "question"  # unknown label from the model -> safest path is RAG
    tags = [t for t in result.get("tags", []) if isinstance(t, str)]
    return {"intent": intent, "tag_filter": tags}


def scoped_reply(state: AgentState) -> AgentState:
    """Off-topic/small talk: deterministic redirect — no retrieval, no LLM cost."""
    return {"answer": prompts.SCOPED_REPLY_TEXT, "citations": [], "grounded": True}


def retrieve(state: AgentState, retriever: Retriever) -> AgentState:
    results = retriever.search(
        state["question"], k=TOP_K, tags=state.get("tag_filter") or None
    )
    # A tag filter that matches nothing (e.g. hallucinated tag) should not
    # produce a false "I don't know" — fall back to unfiltered search.
    if not results and state.get("tag_filter"):
        results = retriever.search(state["question"], k=TOP_K)
    return {"retrieved": results}


def grade(state: AgentState, llm: LLM) -> AgentState:
    retrieved = state["retrieved"]
    if not retrieved:
        return {"graded": [], "answer": prompts.REFUSAL_TEXT, "citations": [], "grounded": True}

    result = llm.complete_json(
        prompts.GRADER_PROMPT,
        f"Question: {state['question']}\n\nChunks:\n{format_docs(retrieved)}",
    )
    keep = {n for n in result.get("relevant", []) if isinstance(n, int)}
    graded = [c for n, c in enumerate(retrieved, start=1) if n in keep]
    if not graded:
        # The hallucination firewall: nearest neighbors exist for any query,
        # but if none are actually relevant we refuse instead of improvising.
        return {"graded": [], "answer": prompts.REFUSAL_TEXT, "citations": [], "grounded": True}
    return {"graded": graded}


def generate(state: AgentState, llm: LLM) -> AgentState:
    system = (
        f"{prompts.SYSTEM_PROMPT}\n\n<docs>\n{format_docs(state['graded'])}\n</docs>"
    )
    if state.get("retry_count", 0) > 0:
        system += prompts.RETRY_INSTRUCTION
    messages = [*state.get("history", []), {"role": "user", "content": state["question"]}]
    draft = llm.complete(system, messages)
    return {"draft": draft}


def check_groundedness(state: AgentState, llm: LLM) -> AgentState:
    docs = format_docs(state["graded"])
    verdict = llm.complete_json(
        prompts.GROUNDEDNESS_PROMPT,
        f"Documents:\n{docs}\n\nDraft answer:\n{state['draft']}",
    )
    if verdict.get("grounded", False):
        return {
            "grounded": True,
            "answer": state["draft"],
            "citations": _extract_citations(state["draft"], state["graded"]),
        }

    retries = state.get("retry_count", 0)
    if retries < MAX_RETRIES:
        logger.info("Groundedness check failed; retrying generation (attempt %d)", retries + 1)
        return {"retry_count": retries + 1}

    # Second failure: conservative fallback — quote only what the docs say.
    logger.warning("Groundedness failed after retry; serving conservative fallback")
    lines = [
        f"- {c.text.splitlines()[-1][:200]} [{n}]"
        for n, c in enumerate(state["graded"][:3], start=1)
    ]
    answer = (
        "Here is what the candidate's documents directly state on this topic:\n"
        + "\n".join(lines)
    )
    return {
        "grounded": False,
        "answer": answer,
        "citations": _extract_citations(answer, state["graded"]),
    }


def _extract_citations(answer: str, graded: list[SearchResult]) -> list[Citation]:
    """Map [n] markers in the answer back to chunk metadata.

    If the model cited nothing (rule violation, but possible), attach all
    graded chunks — over-citing is safer than presenting an answer as
    sourceless.
    """
    cited = []
    for match in re.findall(r"\[(\d+)\]", answer):
        n = int(match)
        if 1 <= n <= len(graded) and n not in cited:
            cited.append(n)
    if not cited:
        cited = list(range(1, len(graded) + 1))
    return [
        Citation(
            n=n,
            title=graded[n - 1].title,
            doc_type=graded[n - 1].doc_type,
            source_file=graded[n - 1].source_file,
            heading=graded[n - 1].heading,
            excerpt=graded[n - 1].text[:240],
        )
        for n in cited
    ]
