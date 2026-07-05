"""Node-level tests with a scripted FakeLLM: each node's contract in isolation."""

from app.agent import nodes, prompts
from app.agent.llm import FakeLLM
from app.rag.models import SearchResult


def make_chunk(title: str, text: str) -> SearchResult:
    return SearchResult(
        text=text, score=0.9, doc_type="project", title=title,
        tags=["nlp"], source_file=f"projects/{title.lower()}.md", heading="Approach",
    )


def test_route_parses_intent_and_tags() -> None:
    llm = FakeLLM(scripted=[{"intent": "filter_projects", "tags": ["nlp", 42]}])
    update = nodes.route({"question": "show nlp projects", "history": []}, llm=llm)
    assert update["intent"] == "filter_projects"
    assert update["tag_filter"] == ["nlp"]  # non-string tag dropped


def test_route_defends_against_unknown_intent_labels() -> None:
    llm = FakeLLM(scripted=[{"intent": "banana", "tags": []}])
    update = nodes.route({"question": "hi", "history": []}, llm=llm)
    assert update["intent"] == "question"  # safest path is RAG, not a crash


def test_grade_keeps_only_relevant_chunks() -> None:
    chunks = [make_chunk("A", "kafka pipeline"), make_chunk("B", "unrelated cooking")]
    llm = FakeLLM(scripted=[{"relevant": [1]}])
    update = nodes.grade({"question": "kafka?", "retrieved": chunks}, llm=llm)
    assert [c.title for c in update["graded"]] == ["A"]


def test_grade_with_nothing_relevant_refuses_honestly() -> None:
    chunks = [make_chunk("A", "kafka pipeline")]
    llm = FakeLLM(scripted=[{"relevant": []}])
    update = nodes.grade({"question": "favorite pizza?", "retrieved": chunks}, llm=llm)
    assert update["graded"] == []
    assert update["answer"] == prompts.REFUSAL_TEXT
    assert update["citations"] == []


def test_generate_then_groundedness_pass_builds_citations() -> None:
    chunks = [make_chunk("A", "built kafka pipeline"), make_chunk("B", "fine-tuned bert")]
    state = {"question": "what did he build?", "history": [], "graded": chunks, "retry_count": 0}

    gen_llm = FakeLLM(scripted=["He built a Kafka pipeline [1] and fine-tuned BERT [2]."])
    state.update(nodes.generate(state, llm=gen_llm))

    judge_llm = FakeLLM(scripted=[{"grounded": True, "unsupported_claims": []}])
    update = nodes.check_groundedness(state, llm=judge_llm)

    assert update["grounded"] is True
    assert update["answer"].startswith("He built")
    assert [c.n for c in update["citations"]] == [1, 2]
    assert update["citations"][0].source_file == "projects/a.md"


def test_groundedness_failure_retries_then_falls_back() -> None:
    chunks = [make_chunk("A", "Title line\nbuilt kafka pipeline")]
    draft = "He won a Nobel prize [1]."
    state = {"question": "q", "graded": chunks, "draft": draft, "retry_count": 0}

    first = nodes.check_groundedness(
        state, llm=FakeLLM(scripted=[{"grounded": False, "unsupported_claims": ["Nobel"]}])
    )
    assert first == {"retry_count": 1}  # no answer yet -> graph loops to generate

    state["retry_count"] = 1
    second = nodes.check_groundedness(
        state, llm=FakeLLM(scripted=[{"grounded": False, "unsupported_claims": ["Nobel"]}])
    )
    assert second["grounded"] is False
    assert "documents directly state" in second["answer"]
    assert second["citations"]  # fallback still cites its sources


def test_heuristic_generate_quotes_docs_not_prompt_rules() -> None:
    # Regression: FakeLLM once scraped "[1] or [2]" out of the system prompt's
    # own citation rule and quoted the agent's instructions back as an answer.
    chunks = [make_chunk("Hiring FAQ", "Hiring FAQ\nHe builds complete AI products.")]
    state = {"question": "why hire him?", "history": [], "graded": chunks, "retry_count": 0}
    update = nodes.generate(state, llm=FakeLLM())

    assert "[1]" in update["draft"]
    assert "He builds complete AI products" in update["draft"]
    assert "If the documents do not contain" not in update["draft"]


def test_retrieve_falls_back_when_tag_filter_matches_nothing() -> None:
    class StubRetriever:
        def __init__(self) -> None:
            self.calls = []

        def search(self, query: str, k: int = 6, tags=None):
            self.calls.append(tags)
            return [] if tags else [make_chunk("A", "x")]

    retriever = StubRetriever()
    update = nodes.retrieve({"question": "q", "tag_filter": ["bogus"]}, retriever=retriever)
    assert retriever.calls == [["bogus"], None]
    assert len(update["retrieved"]) == 1
