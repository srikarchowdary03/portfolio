"""Eval harness tests — all keyless (fake providers via conftest)."""

from pathlib import Path

from evals import metrics
from evals.dataset import DATASET_PATH, load_dataset
from evals.run import run_evals

CONTENT_DIR = Path(__file__).resolve().parents[2] / "content"


def make_result(source_file: str):
    from app.rag.models import SearchResult

    return SearchResult(
        text="x", score=0.5, doc_type="project", title="T",
        tags=[], source_file=source_file, heading="",
    )


def test_golden_dataset_is_valid() -> None:
    items = load_dataset(DATASET_PATH, content_dir=CONTENT_DIR)  # validates sources exist
    assert len(items) >= 30
    assert sum(1 for i in items if not i.answerable) >= 5
    assert all(i.expected_sources for i in items if i.answerable)


def test_retrieval_hit_and_rr() -> None:
    results = [make_result("a.md"), make_result("b.md"), make_result("c.md")]
    assert metrics.retrieval_hit_and_rr(results, ["b.md"]) == (True, 0.5)
    assert metrics.retrieval_hit_and_rr(results, ["z.md"]) == (False, 0.0)
    assert metrics.retrieval_hit_and_rr(results, ["c.md", "a.md"]) == (True, 1.0)


def test_fact_recall_and_refusal() -> None:
    from app.agent import prompts

    assert metrics.fact_recall("He reached 91.8% with DistilBERT", ["91.8", "PyTorch"]) == 0.5
    assert metrics.fact_recall("anything", []) is None
    assert metrics.is_refusal(prompts.REFUSAL_TEXT)
    assert metrics.is_refusal(prompts.SCOPED_REPLY_TEXT)
    assert not metrics.is_refusal("He built a Kafka pipeline [1].")


def test_mini_run_writes_honest_report(tmp_path: Path) -> None:
    result = run_evals(k=6, limit=6, out_dir=tmp_path)

    agg = result["aggregate"]
    assert agg["n_total"] == 6
    assert 0.0 <= agg["hit_rate"] <= 1.0
    # Fake provider: judges must be SKIPPED, never fabricated.
    assert agg["judged"] is False
    assert agg["faithfulness"] is None

    report = (tmp_path / "latest.md").read_text()
    assert "fake providers: plumbing verification only" in report
    assert "skipped: fake provider" in report
    assert (tmp_path / "latest.json").exists()
