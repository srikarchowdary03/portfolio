"""Data shapes shared across the RAG pipeline.

A Document is one markdown file from /content; a Chunk is one indexed unit of
retrieval. Chunk ids are stable ({source_file}#{n}) so eval datasets and chat
logs can reference them across re-ingestions of unchanged content.
"""

from pydantic import BaseModel


class Document(BaseModel):
    text: str
    doc_type: str
    title: str
    tags: list[str]
    source_file: str  # path relative to the content dir, e.g. "projects/vital-stream.md"


class Chunk(BaseModel):
    id: str
    text: str
    doc_type: str
    title: str
    tags: list[str]
    source_file: str
    heading: str  # nearest markdown heading, for human-readable citations


class SearchResult(BaseModel):
    text: str
    score: float  # cosine similarity in [0, 1]-ish space (1 = identical)
    doc_type: str
    title: str
    tags: list[str]
    source_file: str
    heading: str
