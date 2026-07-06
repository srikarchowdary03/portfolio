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
        <p className="microlabel">Architecture — how the demo works</p>
        <h1 className="display mt-3 text-3xl font-semibold">
          The demo is the proof of work
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          The live demo on this site is a RAG system he designed, built, and
          evaluated. Every answer runs through a five-step LangGraph pipeline
          with a hard rule: nothing unverified reaches your screen.
        </p>
      </Reveal>

      {/* Pipeline diagram — ruled, numbered */}
      <Reveal className="mt-12">
        <div
          className="grid border border-border-soft sm:grid-cols-5"
          data-testid="pipeline-diagram"
        >
          {PIPELINE.map((step, i) => (
            <div
              key={step.name}
              className={`bg-surface p-5 ${i > 0 ? "border-t border-border-soft sm:border-l sm:border-t-0" : ""}`}
            >
              <p className="microlabel !text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-sm font-semibold">{step.name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <div className="border-l-2 border-accent-dim py-1 pl-5">
          <h3 className="text-sm font-semibold">Verify-then-stream</h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Streamed tokens can&apos;t be unsaid — so the groundedness gate runs
            <em> before</em> the first token is emitted, and the verified answer
            streams afterward. A second or two of patience buys zero retracted
            claims.
          </p>
        </div>
      </Reveal>

      {/* Stack */}
      <Reveal className="mt-14">
        <h2 className="microlabel">The stack, and why</h2>
        <div className="mt-5 grid border border-border-soft sm:grid-cols-3">
          {STACK.map((item, i) => (
            <div
              key={item.name}
              className={`bg-surface p-5 ${i > 0 ? "border-t border-border-soft" : ""} ${
                i % 3 !== 0 ? "sm:border-l" : ""
              } ${i >= 3 ? "sm:border-t" : "sm:border-t-0"} ${i === 0 ? "border-t-0" : ""}`}
            >
              <p className="font-mono text-[13px] font-medium">{item.name}</p>
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
            className="text-accent underline decoration-accent-dim underline-offset-4 hover:decoration-accent"
          >
            the repository
          </a>
          .
        </p>
      </Reveal>

      {/* Full write-up (the same doc the AI retrieves from) */}
      <Reveal className="mt-16">
        <div className="border-t border-border-soft pt-8">
          <p className="microlabel mb-8">
            The deep dive — also part of the AI&apos;s knowledge base
          </p>
          <Markdown>{doc.body}</Markdown>
        </div>
      </Reveal>

      <Reveal className="mt-12">
        <Link
          href="/chat?q=How does the AI behind this portfolio work?"
          className="btn-primary inline-block px-6 py-3"
        >
          Or just ask the AI itself
        </Link>
      </Reveal>
    </main>
  );
}
