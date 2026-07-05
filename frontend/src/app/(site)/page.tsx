import Link from "next/link";

import { EmbeddingField } from "@/components/home/EmbeddingField";
import { ProjectCard } from "@/components/home/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { getProjects } from "@/lib/content";

const FEATURED_SLUGS = ["ai-portfolio", "ai-job-search-platform", "mental-health-nlp"];

const STATS = [
  { value: "91.8%", label: "DistilBERT classifier accuracy" },
  { value: "5k/sec", label: "Kafka pipeline throughput" },
  { value: "3.9", label: "MS GPA · UMass Boston" },
  { value: "55", label: "students taught LLM engineering" },
  { value: "500+", label: "LeetCode problems solved" },
];

const TECH = [
  "Python", "PyTorch", "LangGraph", "RAG", "OpenAI", "Hugging Face",
  "FastAPI", "Next.js", "TypeScript", "Kafka", "AWS", "Docker", "Terraform",
];

const SKILL_GROUPS = [
  {
    title: "Machine Learning & AI",
    items: "NLP · LLMs · RAG · agents · prompt engineering · embeddings · model evaluation · PyTorch · Transformers · Scikit-learn",
  },
  {
    title: "Backend & APIs",
    items: "FastAPI · REST · Spring Boot · Spring Kafka · Node.js · SQLAlchemy",
  },
  {
    title: "Data & Cloud",
    items: "PostgreSQL · MongoDB · ChromaDB · AWS (EC2, S3, Lambda, RDS…) · SQLite",
  },
  {
    title: "Infra & DevOps",
    items: "Docker · Kubernetes · Terraform · GitHub Actions · Prometheus · Grafana",
  },
];

export default function Home() {
  const projects = getProjects();
  const featured = FEATURED_SLUGS.map((slug) =>
    projects.find((p) => p.slug === slug)
  ).filter((p) => p !== undefined);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <EmbeddingField />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 px-5 pb-24 pt-28 text-center">
          <Reveal>
            <p className="rounded-full border border-border-soft bg-surface/60 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-cyan">
              AI/ML Engineer · GenAI &amp; LLM Systems
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              I build <span className="gradient-text">production AI systems</span> —
              and the evaluation layers that keep them honest.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="max-w-2xl text-balance leading-relaxed text-muted">
              Sai Srikar Chowdary Pattipati — MS Computer Science (ML/NLP) at
              UMass Boston. I ship end-to-end LLM products: RAG pipelines,
              agent architectures, fine-tuned transformers, and the data
              infrastructure underneath. This portfolio is one of them.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/chat"
              className="orb rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-accent/30 transition-all hover:scale-[1.03] hover:brightness-110"
            >
              Ask my AI assistant ✦
            </Link>
            <Link
              href="/projects"
              className="rounded-xl border border-border-soft bg-surface/70 px-7 py-3.5 text-sm font-semibold transition-colors hover:border-accent hover:text-cyan"
            >
              View my work
            </Link>
          </Reveal>
          <Reveal delay={0.32} className="flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {TECH.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border-soft/70 bg-surface/50 px-3 py-1 font-mono text-[11px] text-muted"
              >
                {t}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border-soft/60 bg-surface/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-5">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06} className="text-center">
              <p className="gradient-text text-2xl font-bold sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs leading-snug text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured work</h2>
            <p className="mt-1 text-sm text-muted">
              Rendered from the same documents my AI assistant cites.
            </p>
          </div>
          <Link href="/projects" className="text-sm text-cyan hover:underline">
            All projects →
          </Link>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-3">
          {featured.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.08}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* AI banner */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent-soft/70 to-surface p-8 sm:p-10">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan">Meta</p>
            <h2 className="mt-2 max-w-xl text-2xl font-bold">
              This site is itself an AI system I built end to end.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              A RAG pipeline over my real documents, a LangGraph agent with a
              groundedness gate, source citations on every answer — designed,
              evaluated, and deployed by me.
            </p>
            <Link
              href="/how-it-works"
              className="mt-5 inline-block rounded-xl border border-cyan/40 px-5 py-2.5 text-sm font-medium text-cyan transition-colors hover:bg-cyan/10"
            >
              See the architecture →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Skills */}
      <section className="border-t border-border-soft/60 bg-surface/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <h2 className="mb-8 text-2xl font-bold">Skills</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {SKILL_GROUPS.map((group, i) => (
              <Reveal key={group.title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-border-soft bg-surface/80 p-5">
                  <h3 className="text-sm font-semibold text-cyan">{group.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                    {group.items}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Experience & education */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <h2 className="mb-8 text-2xl font-bold">Experience &amp; education</h2>
        </Reveal>
        <div className="space-y-6 border-l border-border-soft pl-6">
          {[
            {
              period: "Sep 2025 – May 2026",
              title: "Teaching Fellow / Instructor — UMass Boston",
              detail:
                "Designed and taught IT110 & CS188sl to 55 students: Python, Java OOP, REST APIs, algorithms — and hands-on LLM engineering (LangChain, RAG, agents, n8n).",
            },
            {
              period: "Aug 2024 – May 2026 (exp.)",
              title: "MS Computer Science — University of Massachusetts Boston",
              detail: "GPA 3.9/4.0 · Focus: Machine Learning & Natural Language Processing.",
            },
            {
              period: "Aug 2020 – May 2024",
              title: "BE Computer Science — RMK Engineering College",
              detail: "GPA 3.38/4.0.",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="relative">
                <span className="orb absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full" />
                <p className="font-mono text-xs text-cyan">{item.period}</p>
                <h3 className="mt-1 font-semibold">{item.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
                  {item.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-border-soft/60">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <Reveal>
            <h2 className="text-2xl font-bold">
              Hiring for <span className="gradient-text">GenAI / LLM engineering</span>?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              F-1 OPT · open to any location and remote · available May 2026.
              Ask my assistant the hard questions first, then let&apos;s talk.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:S.Pattipati002@umb.edu"
                className="orb rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:brightness-110"
              >
                Email me
              </a>
              <Link
                href="/resume"
                className="rounded-xl border border-border-soft px-6 py-3 text-sm font-semibold hover:border-accent hover:text-cyan"
              >
                View resume
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
