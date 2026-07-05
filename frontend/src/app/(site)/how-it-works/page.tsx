import type { Metadata } from "next";
import Link from "next/link";

import { Markdown } from "@/components/site/Markdown";
import { Reveal } from "@/components/site/Reveal";
import { getDoc } from "@/lib/content";

export const metadata: Metadata = {
  title: "How it works — Srikar Pattipati",
  description:
    "The architecture of this AI portfolio: RAG pipeline, LangGraph agent, groundedness checking, and evaluation.",
};

const PIPELINE = [
  {
    name: "Router",
    detail: "Classifies intent and extracts topic filters. Small talk never touches retrieval.",
  },
  {
    name: "Retrieve",
    detail: "Embeds the question, pulls the 6 nearest chunks from ChromaDB — tag-filtered when asked.",
  },
  {
    name: "Grade",
    detail: "An LLM judges each chunk for real relevance. Nothing relevant → an honest “I don't know.”",
  },
  {
    name: "Generate",
    detail: "gpt-4o-mini writes only from surviving chunks; every claim carries a [n] citation.",
  },
  {
    name: "Groundedness",
    detail: "A judge verifies every claim against the sources — one retry, then a conservative fallback.",
  },
];

const STACK = [
  { name: "FastAPI + LangGraph", why: "explicit, testable agent state machine" },
  { name: "OpenAI gpt-4o-mini", why: "right-sized model; evals prove quality" },
  { name: "text-embedding-3-small", why: "strong retrieval at negligible cost" },
  { name: "ChromaDB (embedded)", why: "index rebuilt per deploy — no drift, no infra" },
  { name: "Next.js + SSE", why: "streamed answers over plain HTTP" },
  { name: "Docker + CI + evals", why: "tested keyless via provider fakes" },
];

export default function HowItWorksPage() {
  const doc = getDoc("faq/how-this-ai-works.md");
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan">Architecture</p>
        <h1 className="mt-2 text-3xl font-bold">How this AI portfolio works</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Every answer the assistant gives runs through a five-step LangGraph
          pipeline with a hard rule: nothing unverified reaches your screen.
        </p>
      </Reveal>

      {/* Pipeline diagram */}
      <Reveal className="mt-10">
        <div
          className="grid gap-3 sm:grid-cols-5"
          data-testid="pipeline-diagram"
        >
          {PIPELINE.map((step, i) => (
            <div
              key={step.name}
              className="relative rounded-2xl border border-border-soft bg-surface/80 p-4"
            >
              <span className="orb flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-2.5 text-sm font-semibold text-cyan">{step.name}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{step.detail}</p>
              {i < PIPELINE.length - 1 && (
                <span className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-border-soft sm:block">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <div className="rounded-2xl border border-accent/30 bg-accent-soft/40 p-5">
          <h3 className="text-sm font-semibold">Verify-then-stream</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Streamed tokens can&apos;t be unsaid — so the groundedness gate runs
            <em> before</em> the first token is emitted, and the verified answer
            streams afterward. A second or two of patience buys zero retracted
            claims.
          </p>
        </div>
      </Reveal>

      {/* Stack */}
      <Reveal className="mt-12">
        <h2 className="text-xl font-semibold">The stack, and why</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {STACK.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-border-soft bg-surface/70 p-4"
            >
              <p className="font-mono text-[13px] font-semibold text-foreground">
                {item.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{item.why}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Full architecture docs, diagrams, and decision records live in{" "}
          <a
            href="https://github.com/srikarchowdary03/portfolio/tree/main/docs"
            target="_blank"
            rel="noreferrer"
            className="text-cyan underline decoration-cyan/40 hover:decoration-cyan"
          >
            the repository
          </a>
          .
        </p>
      </Reveal>

      {/* Full write-up (the same doc the AI retrieves from) */}
      <Reveal className="mt-14">
        <div className="rounded-3xl border border-border-soft bg-surface/60 p-6 sm:p-10">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-muted">
            The deep dive — also part of the AI&apos;s knowledge base
          </p>
          <Markdown>{doc.body}</Markdown>
        </div>
      </Reveal>

      <Reveal className="mt-10 text-center">
        <Link
          href="/chat?q=How does the AI behind this portfolio work?"
          className="orb inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:brightness-110"
        >
          Or just ask the AI itself ✦
        </Link>
      </Reveal>
    </main>
  );
}
