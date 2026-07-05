import Link from "next/link";

// Interim landing page — the full portfolio home (hero animation, projects,
// experience, design system) ships in Phase 4.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan">
          AI/ML Engineer · Boston, MA
        </p>
        <h1 className="text-4xl font-bold sm:text-5xl">
          Sai Srikar Chowdary Pattipati
        </h1>
        <p className="mx-auto max-w-xl text-balance text-muted">
          I build production AI systems — RAG pipelines, LLM agents, and the
          evaluation layers that keep them honest. This portfolio is itself one
          of them: ask its AI assistant anything about me.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/chat"
          className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-[1.03]"
        >
          Ask my AI assistant →
        </Link>
        <span className="rounded-xl border border-border-soft px-6 py-3 text-sm text-muted">
          Full portfolio coming in Phase 4
        </span>
      </div>

      <p className="text-xs text-muted">
        Grounded answers · source citations · zero hallucination by design
      </p>
    </main>
  );
}
