"""Agent state and result shapes.

AgentState is the single mutable object that flows through the LangGraph
graph; each node reads what it needs and returns the fields it updates.
"""

from typing import TypedDict

from pydantic import BaseModel

from app.rag.models import SearchResult


class AgentState(TypedDict, total=False):
    question: str
    history: list[dict]  # prior turns: [{"role": "user"|"assistant", "content": str}]
    intent: str  # question | filter_projects | compare | off_topic
    tag_filter: list[str]
    retrieved: list[SearchResult]
    graded: list[SearchResult]
    draft: str
    retry_count: int
    grounded: bool
    answer: str
    citations: list["Citation"]


class Citation(BaseModel):
    n: int
    title: str
    doc_type: str
    source_file: str
    heading: str
    excerpt: str


class AgentResult(BaseModel):
    answer: str
    citations: list[Citation]
    intent: str
    grounded: bool
    retrieved_count: int
    used_count: int
    # Full text of the graded chunks the generator actually saw. Not exposed
    # over the API; the eval judge audits faithfulness against THIS context,
    # not raw retrieval (which can differ under tag-filtered search).
    context_texts: list[str] = []
