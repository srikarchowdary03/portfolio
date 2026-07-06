import Link from "next/link";

import { CountUp } from "@/components/home/CountUp";
import { EmbeddingField } from "@/components/home/EmbeddingField";
import { ProjectCard } from "@/components/home/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { getProjects, getReleases } from "@/lib/content";

// Every value below is a fact from the knowledge base — the product framing
// is presentation only (deadpan rule: format supplies the humor, never the
// claims).

const BENCHMARKS = [
  { value: 91.8, decimals: 1, suffix: "%", label: "Text classification accuracy", note: "DistilBERT, held-out set" },
  { value: 5000, suffix: "/s", label: "Stream ingest throughput", note: "3-broker Kafka, zero lag" },
  { value: 3.9, decimals: 1, suffix: "", label: "MS GPA", note: "UMass Boston, ML/NLP" },
  { value: 500, suffix: "+", label: "LeetCode problems", note: "data structures & algorithms" },
  { value: 55, suffix: "", label: "Students taught", note: "incl. LangChain, RAG, agents" },
];

const INTEGRATIONS = [
  "Python", "PyTorch", "Hugging Face", "LangGraph", "LangChain", "OpenAI",
  "Anthropic", "FastAPI", "ChromaDB", "PostgreSQL", "Kafka", "Spring Boot",
  "Next.js", "TypeScript", "React", "AWS", "Docker", "Kubernetes",
  "Terraform", "GitHub Actions",
];

const PLANS = [
  {
    name: "Full-time",
    tag: "Recommended",
    availability: "GA May 2026",
    features: [
      "RAG system design with source citations",
      "LLM evaluation harnesses (retrieval + judge metrics)",
      "Agent architectures (LangGraph) with bounded failure modes",
      "Transformer fine-tuning (91.8% production classifier)",
      "Streaming data infrastructure (5k events/s)",
      "Teaching-grade communication — 55 students taught",
    ],
  },
  {
    name: "Internship / Co-op",
    tag: "Spring 2026",
    availability: "Limited availability",
    features: [
      "Same engineering, shorter engagement",
      "Full-stack LLM feature delivery",
      "Evaluation-first development practice",
      "Boston local or fully remote",
    ],
  },
];

export default function Home() {
  const projects = getProjects();
  const releases = getReleases().slice(0, 3);

  return (
    <main>
      {/* ── Model card hero ─────────────────────────────────────────── */}
      <section className="blueprint relative overflow-hidden border-b border-border-soft">
        <EmbeddingField />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 sm:pt-28">
          <Reveal>
            <p className="microlabel">
              Model release — Boston, MA · <span className="text-accent">status: available May 2026</span>
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mt-5 font-mono text-5xl font-bold tracking-[0.06em] sm:text-7xl">
              SRIKAR{" "}
              <span className="align-super text-lg text-accent sm:text-xl">v3.0-beta</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              <span className="text-foreground">Sai Srikar Chowdary Pattipati</span> — a
              production-grade AI/ML engineer. Ships with built-in evaluation,
              cited sources, and a working demo. Trained at UMass Boston
              (MS Computer Science, ML/NLP); currently serving 55 students as
              Teaching Fellow.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="microlabel mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <span>GA: <span className="!text-foreground">May 2026</span></span>
              <span>License: <span className="!text-foreground">F-1 OPT</span></span>
              <span>Deployment: <span className="!text-foreground">any region · remote supported</span></span>
              <span>Source: <span className="!text-foreground">open — github.com/srikarchowdary03</span></span>
            </div>
          </Reveal>
          <Reveal delay={0.24} className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/chat" className="btn-primary px-6 py-3" data-testid="hero-demo-cta">
              Try the live demo
            </Link>
            <Link
              href="/resume"
              className="rounded-md border border-border-soft px-6 py-3 text-sm font-medium transition-colors hover:border-foreground"
            >
              Read the spec
            </Link>
          </Reveal>

          {/* Benchmarks — the signature moment */}
          <Reveal delay={0.3}>
            <div
              className="mt-12 grid border border-border-soft bg-surface sm:grid-cols-5"
              data-testid="benchmarks"
            >
              <p className="microlabel col-span-full border-b border-border-soft px-4 py-2.5">
                Benchmarks <span className="normal-case">(all reproducible — sources in the demo)</span>
              </p>
              {BENCHMARKS.map((b, i) => (
                <div
                  key={b.label}
                  className={`px-4 py-5 ${i > 0 ? "border-t border-border-soft sm:border-l sm:border-t-0" : ""}`}
                >
                  <p className="font-mono text-2xl font-medium tracking-tight text-accent">
                    <CountUp value={b.value} decimals={b.decimals ?? 0} suffix={b.suffix} />
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-foreground/85">{b.label}</p>
                  <p className="microlabel mt-0.5 normal-case">{b.note}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Capabilities ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="mb-8 flex items-baseline justify-between">
          <h2 className="microlabel">
            <span className="text-accent">01</span> — Capabilities
          </h2>
          <p className="microlabel normal-case">Each shipped as a working system, not a course certificate.</p>
        </Reveal>
        <div>
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.04}>
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Live demo banner ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Reveal>
          <div className="border border-border-soft bg-surface p-8 sm:p-10">
            <p className="microlabel">
              <span className="text-accent">02</span> — Live demo
            </p>
            <h2 className="display mt-4 max-w-2xl text-2xl font-semibold">
              Most portfolios make claims. This one takes questions.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              The demo is a RAG assistant he built into this site: ask it
              anything about him and it answers only from his real documents,
              with citations you can open. Refuses what it can&apos;t source.
            </p>
            <Link href="/chat" className="btn-primary mt-6 inline-block px-5 py-2.5">
              Open the demo
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Integrations ────────────────────────────────────────────── */}
      <section className="border-t border-border-soft bg-surface/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <h2 className="microlabel mb-2">
              <span className="text-accent">03</span> — Integrations
            </h2>
            <p className="mb-8 text-sm text-muted">Works with your existing stack.</p>
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-2 border-l border-t border-border-soft sm:grid-cols-4 lg:grid-cols-5" data-testid="integrations">
              {INTEGRATIONS.map((name) => (
                <div
                  key={name}
                  className="border-b border-r border-border-soft bg-background px-4 py-4 text-center font-mono text-[12px] text-foreground/80 transition-colors hover:bg-surface hover:text-accent"
                >
                  {name}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Changelog preview ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="mb-8 flex items-baseline justify-between">
          <h2 className="microlabel">
            <span className="text-accent">04</span> — Releases
          </h2>
          <Link href="/changelog" className="microlabel transition-colors hover:!text-accent">
            Full changelog →
          </Link>
        </Reveal>
        <div>
          {releases.map((release, i) => (
            <Reveal key={release.version} delay={i * 0.04}>
              <div className="grid gap-2 border-t border-border-soft py-5 last:border-b sm:grid-cols-[130px_1fr] sm:gap-8">
                <p className="font-mono text-sm font-semibold text-accent">{release.version}</p>
                <div>
                  <h3 className="text-[15px] font-medium">{release.title}</h3>
                  <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted">
                    {release.body.replace(/\n+/g, " ")}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Deploy (hiring) ─────────────────────────────────────────── */}
      <section id="deploy" className="border-t border-border-soft">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <h2 className="microlabel">
              <span className="text-accent">05</span> — Deploy SRIKAR
            </h2>
            <p className="display mt-4 max-w-xl text-2xl font-semibold">
              Two deployment options. Both include the engineer.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2" data-testid="deploy-plans">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.06}>
                <div className={`flex h-full flex-col border bg-surface p-7 ${i === 0 ? "border-accent-dim" : "border-border-soft"}`}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <span className={`microlabel ${i === 0 ? "!text-accent" : ""}`}>{plan.tag}</span>
                  </div>
                  <p className="microlabel mt-1">{plan.availability}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5 text-sm text-foreground/85">
                        <span className="font-mono text-accent" aria-hidden>+</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex gap-3">
                    <a href="mailto:S.Pattipati002@umb.edu" className="btn-primary px-5 py-2.5">
                      Start deployment
                    </a>
                    <Link
                      href="/resume"
                      className="rounded-md border border-border-soft px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground"
                    >
                      Spec sheet
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="microlabel mt-6 normal-case">
            Fine print: work authorization F-1 OPT · open to any location and fully remote ·
            references and source code available on request.
          </p>
        </div>
      </section>
    </main>
  );
}
