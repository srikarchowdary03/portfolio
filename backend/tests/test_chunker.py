from app.rag.chunker import MAX_TOKENS, chunk_document, get_tokenizer
from app.rag.models import Document


def make_doc(text: str) -> Document:
    return Document(
        text=text,
        doc_type="project",
        title="Test Project",
        tags=["nlp"],
        source_file="projects/test.md",
    )


def test_splits_on_headings() -> None:
    doc = make_doc("intro line\n\n## Problem\nthe problem\n\n## Results\nthe results")
    chunks = chunk_document(doc)

    assert [c.heading for c in chunks] == ["", "Problem", "Results"]
    assert "the problem" in chunks[1].text
    # The heading line itself is kept inside the chunk text.
    assert "## Results" in chunks[2].text


def test_chunk_ids_are_stable_and_metadata_propagates() -> None:
    doc = make_doc("## A\nalpha\n\n## B\nbeta")
    chunks = chunk_document(doc)

    assert [c.id for c in chunks] == ["projects/test.md#0", "projects/test.md#1"]
    assert all(c.tags == ["nlp"] and c.doc_type == "project" for c in chunks)
    # Title is prefixed into the text so chunks embed with document context.
    assert all(c.text.startswith("Test Project") for c in chunks)


def test_oversized_section_is_split_with_overlap() -> None:
    tokenizer = get_tokenizer()
    long_section = "## Big\n" + " ".join(f"word{i}" for i in range(2000))
    chunks = chunk_document(make_doc(long_section))

    assert len(chunks) > 1
    for chunk in chunks:
        # Title prefix adds a few tokens on top of the MAX_TOKENS window.
        assert len(tokenizer.encode(chunk.text)) <= MAX_TOKENS + 10
    # Consecutive windows overlap: the tail of one chunk reappears in the next.
    tail = chunks[0].text.split()[-5:]
    assert " ".join(tail) in chunks[1].text
