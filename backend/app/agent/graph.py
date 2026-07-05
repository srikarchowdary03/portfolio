"""The agent graph — LangGraph wiring of docs/agent-graph.md.

        route ──off_topic──▶ scoped_reply ──▶ END
          │
        retrieve ──▶ grade ──none relevant──▶ END (honest refusal, set in grade)
                       │
                    generate ──▶ check_groundedness ──pass/fallback──▶ END
                       ▲                │
                       └──── retry ─────┘   (bounded: one retry)

Dependencies (retriever, LLM) are bound once at startup; the compiled graph is
reused for every request.
"""

from functools import partial

from langgraph.graph import END, StateGraph

from app.agent import nodes, prompts
from app.agent.llm import LLM
from app.agent.state import AgentResult, AgentState
from app.rag.retriever import Retriever


def _after_route(state: AgentState) -> str:
    return "scoped_reply" if state["intent"] == "off_topic" else "retrieve"


def _after_grade(state: AgentState) -> str:
    return "generate" if state["graded"] else END


def _after_groundedness(state: AgentState) -> str:
    return END if "answer" in state else "generate"


class AgentRunner:
    def __init__(self, retriever: Retriever, llm: LLM) -> None:
        graph = StateGraph(AgentState)
        graph.add_node("route", partial(nodes.route, llm=llm))
        graph.add_node("scoped_reply", nodes.scoped_reply)
        graph.add_node("retrieve", partial(nodes.retrieve, retriever=retriever))
        graph.add_node("grade", partial(nodes.grade, llm=llm))
        graph.add_node("generate", partial(nodes.generate, llm=llm))
        graph.add_node("check_groundedness", partial(nodes.check_groundedness, llm=llm))

        graph.set_entry_point("route")
        graph.add_conditional_edges("route", _after_route)
        graph.add_edge("scoped_reply", END)
        graph.add_edge("retrieve", "grade")
        graph.add_conditional_edges("grade", _after_grade)
        graph.add_edge("generate", "check_groundedness")
        graph.add_conditional_edges("check_groundedness", _after_groundedness)

        self._graph = graph.compile()
        self._llm = llm

    def run(self, question: str, history: list[dict] | None = None) -> AgentResult:
        final: AgentState = self._graph.invoke(
            {"question": question, "history": history or [], "retry_count": 0}
        )
        return AgentResult(
            answer=final["answer"],
            citations=final.get("citations", []),
            intent=final.get("intent", "question"),
            grounded=final.get("grounded", False),
            retrieved_count=len(final.get("retrieved", [])),
            used_count=len(final.get("graded", [])),
        )

    def suggest_followups(self, question: str, answer: str) -> list[str]:
        """Post-answer UX, deliberately outside the graph: not part of the
        grounded answer path, and the API overlaps this call with token
        streaming so its latency is invisible to the user."""
        result = self._llm.complete_json(
            prompts.FOLLOWUP_PROMPT,
            f"They asked: {question}\n\nThe answer they received:\n{answer[:1500]}",
        )
        questions = result.get("questions", [])
        return [q.strip() for q in questions if isinstance(q, str) and q.strip()][:3]
