"""Offline evaluation runner.

    uv run python -m evals.run [--k 6] [--limit N] [--out ../docs/evals]
                               [--fail-under-hit-rate X] [--fail-under-faithfulness Y]

Builds the exact production pipeline (same code path as app startup), runs
the golden dataset through raw retrieval AND the full agent, and writes
docs/evals/latest.md + latest.json. Judge metrics require LLM_PROVIDER=openai;
under the fake provider they are reported as skipped, never simulated.
"""

import argparse
import json
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

from app.agent.graph import AgentRunner
from app.agent.llm import build_llm
from app.agent.nodes import format_docs
from app.core.config import get_settings
from app.rag.embedder import build_embedder
from app.rag.ingest import ingest
from app.rag.retriever import Retriever
from app.rag.store import VectorStore
from evals import judges, metrics
from evals.dataset import DATASET_PATH, GoldenItem, load_dataset


def evaluate_item(
    item: GoldenItem, retriever: Retriever, agent: AgentRunner, llm, k: int, use_judges: bool
) -> dict:
    t0 = time.perf_counter()
    retrieved = retriever.search(item.question, k=k)
    retrieval_ms = round((time.perf_counter() - t0) * 1000)

    t1 = time.perf_counter()
    result = agent.run(item.question)
    agent_ms = round((time.perf_counter() - t1) * 1000)

    hit, rr = metrics.retrieval_hit_and_rr(retrieved, item.expected_sources)
    refused = metrics.is_refusal(result.answer)

    record = {
        "id": item.id,
        "category": item.category,
        "question": item.question,
        "answerable": item.answerable,
        "hit": hit if item.answerable else None,
        "rr": rr if item.answerable else None,
        "fact_recall": metrics.fact_recall(result.answer, item.expected_facts)
        if item.answerable and not refused
        else (0.0 if item.answerable else None),
        "refusal_correct": (not refused) if item.answerable else refused,
        "cited": bool(result.citations) if item.answerable and not refused else None,
        "grounded_flag": result.grounded,
        "intent": result.intent,
        "retrieval_ms": retrieval_ms,
        "agent_ms": agent_ms,
        "answer": result.answer,
        "faithfulness": None,
        "relevance": None,
        "unsupported_claims": [],
    }

    if use_judges and item.answerable and not refused:
        docs_text = format_docs(retrieved)
        record["faithfulness"], record["unsupported_claims"] = judges.judge_faithfulness(
            llm, docs_text, result.answer
        )
        record["relevance"] = judges.judge_relevance(llm, item.question, result.answer)
    return record


def aggregate(records: list[dict], use_judges: bool) -> dict:
    answerable = [r for r in records if r["answerable"]]
    oos = [r for r in records if not r["answerable"]]
    judged = [r for r in answerable if r["faithfulness"] is not None]

    return {
        "n_total": len(records),
        "n_answerable": len(answerable),
        "n_out_of_scope": len(oos),
        "hit_rate": metrics.mean([1.0 if r["hit"] else 0.0 for r in answerable]),
        "mrr": metrics.mean([r["rr"] or 0.0 for r in answerable]),
        "fact_recall": metrics.mean(
            [r["fact_recall"] for r in answerable if r["fact_recall"] is not None]
        ),
        "citation_presence": metrics.mean(
            [1.0 if r["cited"] else 0.0 for r in answerable if r["cited"] is not None]
        ),
        "answer_rate": metrics.mean([1.0 if r["refusal_correct"] else 0.0 for r in answerable]),
        "refusal_correctness": metrics.mean(
            [1.0 if r["refusal_correct"] else 0.0 for r in oos]
        ),
        "faithfulness": metrics.mean([r["faithfulness"] for r in judged]) if judged else None,
        "relevance": metrics.mean([r["relevance"] for r in judged]) if judged else None,
        "judged": use_judges,
        "latency_agent_p50_ms": metrics.percentile([r["agent_ms"] for r in records], 0.5),
        "latency_agent_p95_ms": metrics.percentile([r["agent_ms"] for r in records], 0.95),
    }


def fmt(value: float | None, pct: bool = True) -> str:
    if value is None:
        return "— (skipped: fake provider)"
    return f"{value:.1%}" if pct else f"{value:.3f}"


def write_report(out_dir: Path, agg: dict, records: list[dict], meta: dict) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    fake_warning = (
        " ⚠️ *fake providers: plumbing verification only — semantic scores are not meaningful*"
        if meta["llm_provider"] != "openai"
        else ""
    )
    latency = (
        f"{agg['latency_agent_p50_ms']:.0f} / {agg['latency_agent_p95_ms']:.0f} ms"
    )
    table = [
        (f"Retrieval hit-rate@{meta['k']}", fmt(agg["hit_rate"]), "expected doc in top-k"),
        ("MRR", fmt(agg["mrr"], pct=False), "rank of first expected doc"),
        ("Fact recall", fmt(agg["fact_recall"]), "expected facts present in answers"),
        ("Citation presence", fmt(agg["citation_presence"]), "answers carrying ≥1 citation"),
        ("Answer rate", fmt(agg["answer_rate"]), "answerable items actually answered"),
        ("Refusal correctness", fmt(agg["refusal_correctness"]), "out-of-scope declined"),
        ("Faithfulness (LLM judge)", fmt(agg["faithfulness"]), "claims supported by docs"),
        ("Answer relevance (LLM judge)", fmt(agg["relevance"]), "answers address the question"),
        ("Agent latency p50 / p95", latency, "full pipeline"),
    ]
    lines = [
        "# RAG Evaluation Report",
        "",
        f"- **Date:** {meta['date']}",
        "- **Providers:** "
        f"embeddings=`{meta['embeddings_provider']}` llm=`{meta['llm_provider']}`{fake_warning}",
        f"- **Model:** {meta['chat_model']} · **k:** {meta['k']} · "
        f"**Dataset:** {agg['n_total']} items "
        f"({agg['n_answerable']} answerable, {agg['n_out_of_scope']} out-of-scope)",
        "",
        "## Aggregate metrics",
        "",
        "| Metric | Score | What it measures |",
        "|---|---|---|",
        *[f"| {label} | {value} | {what} |" for label, value, what in table],
        "",
        "## Per-item results",
        "",
        "| id | cat | hit | rr | facts | refusal ok | faithfulness |",
        "|---|---|---|---|---|---|---|",
    ]
    for r in records:
        hit = "—" if r["hit"] is None else ("✓" if r["hit"] else "✗")
        rr = "—" if r["rr"] is None else f"{r['rr']:.2f}"
        facts = "—" if r["fact_recall"] is None else f"{r['fact_recall']:.0%}"
        refusal = "✓" if r["refusal_correct"] else "✗"
        faith = "—" if r["faithfulness"] is None else f"{r['faithfulness']:.0%}"
        lines.append(
            f"| {r['id']} | {r['category']} | {hit} | {rr} | {facts} | {refusal} | {faith} |"
        )

    flagged = [r for r in records if r["unsupported_claims"]]
    if flagged:
        lines += ["", "## Unsupported claims flagged by the judge", ""]
        for r in flagged:
            lines.append(f"- **{r['id']}**: " + "; ".join(r["unsupported_claims"]))

    (out_dir / "latest.md").write_text("\n".join(lines) + "\n")
    (out_dir / "latest.json").write_text(
        json.dumps({"meta": meta, "aggregate": agg, "records": records}, indent=2) + "\n"
    )


def run_evals(
    k: int = 6,
    limit: int | None = None,
    out_dir: Path | None = None,
    dataset_path: Path = DATASET_PATH,
) -> dict:
    settings = get_settings()
    items = load_dataset(dataset_path, content_dir=settings.content_path)
    if limit:
        items = items[:limit]

    embedder = build_embedder(settings.embeddings_provider, settings.openai_api_key)
    store = VectorStore()
    ingest(content_dir=settings.content_path, embedder=embedder, store=store)
    retriever = Retriever(embedder, store)
    llm = build_llm(settings.llm_provider, settings.openai_api_key, settings.chat_model)
    agent = AgentRunner(retriever, llm)

    use_judges = settings.llm_provider == "openai"
    records = [
        evaluate_item(item, retriever, agent, llm, k=k, use_judges=use_judges)
        for item in items
    ]
    agg = aggregate(records, use_judges)

    meta = {
        "date": datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC"),
        "embeddings_provider": settings.embeddings_provider,
        "llm_provider": settings.llm_provider,
        "chat_model": settings.chat_model,
        "k": k,
    }
    if out_dir is not None:
        write_report(out_dir, agg, records, meta)
    return {"meta": meta, "aggregate": agg, "records": records}


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the RAG evaluation suite")
    parser.add_argument("--k", type=int, default=6)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--out", type=Path, default=Path("../docs/evals"))
    parser.add_argument("--fail-under-hit-rate", type=float, default=None)
    parser.add_argument("--fail-under-faithfulness", type=float, default=None)
    args = parser.parse_args()

    result = run_evals(k=args.k, limit=args.limit, out_dir=args.out)
    agg = result["aggregate"]

    faith = "skipped" if agg["faithfulness"] is None else f"{agg['faithfulness']:.1%}"
    print(f"\nReport written to {args.out}/latest.md")
    print(
        f"hit_rate@{args.k}={agg['hit_rate']:.1%}  mrr={agg['mrr']:.3f}  "
        f"refusal={agg['refusal_correctness']:.1%}  faithfulness={faith}"
    )

    failed = False
    if args.fail_under_hit_rate is not None and agg["hit_rate"] < args.fail_under_hit_rate:
        print(f"FAIL: hit_rate {agg['hit_rate']:.1%} < {args.fail_under_hit_rate:.1%}")
        failed = True
    if args.fail_under_faithfulness is not None:
        if agg["faithfulness"] is None:
            print("FAIL: faithfulness threshold set but judges were skipped (fake provider)")
            failed = True
        elif agg["faithfulness"] < args.fail_under_faithfulness:
            print(
                f"FAIL: faithfulness {agg['faithfulness']:.1%}"
                f" < {args.fail_under_faithfulness:.1%}"
            )
            failed = True
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
