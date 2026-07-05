"""Full-graph tests: heuristic FakeLLM + FakeEmbedder over a tiny real KB."""

from pathlib import Path

from app.agent.graph import AgentRunner
from app.agent.llm import FakeLLM
from app.agent.prompts import SCOPED_REPLY_TEXT
from app.rag.embedder import FakeEmbedder
from app.rag.ingest import ingest
from app.rag.retriever import Retriever
from app.rag.store import VectorStore


def build_runner(tmp_path: Path) -> AgentRunner:
    (tmp_path / "kafka.md").write_text(
        "---\ntype: project\ntitle: \"Kafka Pipeline\"\ntags: [kafka]\n---\n\n"
        "## Approach\nHe built a kafka streaming pipeline ingesting events at high throughput."
    )
    (tmp_path / "nlp.md").write_text(
        "---\ntype: project\ntitle: \"NLP Classifier\"\ntags: [nlp]\n---\n\n"
        "## Approach\nHe fine-tuned a transformer model for text classification."
    )
    embedder = FakeEmbedder()
    store = VectorStore()
    ingest(content_dir=tmp_path, embedder=embedder, store=store)
    return AgentRunner(Retriever(embedder, store), FakeLLM())


def test_candidate_question_yields_grounded_cited_answer(tmp_path: Path) -> None:
    runner = build_runner(tmp_path)
    result = runner.run("What kafka project did he build?")

    assert result.intent in {"question", "filter_projects"}
    assert result.grounded is True
    assert "[1]" in result.answer
    assert result.citations and result.citations[0].title == "Kafka Pipeline"
    assert result.retrieved_count > 0
    assert 0 < result.used_count <= result.retrieved_count


def test_suggest_followups_validates_output(tmp_path: Path) -> None:
    runner = build_runner(tmp_path)
    followups = runner.suggest_followups("his skills?", "He knows Python [1].")
    assert 1 <= len(followups) <= 3
    assert all(isinstance(q, str) and q for q in followups)

    # Scripted junk from the model is filtered, capped at 3.
    from app.agent.llm import FakeLLM
    from app.rag.embedder import FakeEmbedder
    from app.rag.retriever import Retriever
    from app.rag.store import VectorStore

    junk_llm = FakeLLM(scripted=[{"questions": ["ok?", 42, "", "two?", "three?", "four?"]}])
    junk_runner = AgentRunner(Retriever(FakeEmbedder(), VectorStore()), junk_llm)
    assert junk_runner.suggest_followups("q", "a") == ["ok?", "two?", "three?"]


def test_off_topic_gets_scoped_reply_without_retrieval(tmp_path: Path) -> None:
    runner = build_runner(tmp_path)
    result = runner.run("What's the weather today?")

    assert result.intent == "off_topic"
    assert result.answer == SCOPED_REPLY_TEXT
    assert result.citations == []
    assert result.retrieved_count == 0
