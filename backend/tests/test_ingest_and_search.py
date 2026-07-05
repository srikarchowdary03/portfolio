from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.rag.embedder import FakeEmbedder
from app.rag.ingest import ingest
from app.rag.retriever import Retriever
from app.rag.store import VectorStore


def write_doc(directory: Path, name: str, doc_type: str, title: str, tags: str, body: str) -> None:
    (directory / name).write_text(
        f"---\ntype: {doc_type}\ntitle: \"{title}\"\ntags: [{tags}]\n---\n\n{body}"
    )


def build_retriever(tmp_path: Path) -> Retriever:
    write_doc(
        tmp_path, "kafka.md", "project", "Kafka Pipeline", "backend, kafka",
        "## Approach\nA kafka streaming pipeline ingesting biometric events at high throughput.",
    )
    write_doc(
        tmp_path, "nlp.md", "project", "NLP Classifier", "nlp",
        "## Approach\nFine-tuned a transformer model for text classification of reddit posts.",
    )
    embedder = FakeEmbedder()
    store = VectorStore()
    stats = ingest(content_dir=tmp_path, embedder=embedder, store=store)
    assert stats["documents"] == 2 and stats["chunks"] == 2
    return Retriever(embedder, store)


def test_search_ranks_word_overlap_first(tmp_path: Path) -> None:
    # FakeEmbedder is bag-of-words hashing: shared words => higher similarity,
    # which is exactly enough to assert ranking plumbing end to end.
    retriever = build_retriever(tmp_path)
    results = retriever.search("kafka streaming pipeline", k=2)

    assert results[0].title == "Kafka Pipeline"
    assert results[0].score > results[1].score
    assert results[0].source_file == "kafka.md"
    assert results[0].heading == "Approach"


def test_tag_filter_excludes_other_docs(tmp_path: Path) -> None:
    retriever = build_retriever(tmp_path)
    results = retriever.search("kafka streaming pipeline", k=5, tags=["nlp"])

    assert [r.title for r in results] == ["NLP Classifier"]


def test_search_api_over_real_content() -> None:
    # Full-stack: lifespan ingests the real /content KB with fake embeddings.
    with TestClient(app) as client:
        ok = client.get("/api/search", params={"q": "kafka biometric event pipeline"})
        filtered = client.get("/api/search", params={"q": "projects", "tags": "nlp"})
        too_short = client.get("/api/search", params={"q": "x"})

    assert ok.status_code == 200
    body = ok.json()
    assert body["count"] > 0
    first = body["results"][0]
    assert {"text", "score", "doc_type", "title", "tags", "source_file", "heading"} <= first.keys()

    assert filtered.status_code == 200
    assert all("nlp" in r["tags"] for r in filtered.json()["results"])

    assert too_short.status_code == 422  # query length validation
