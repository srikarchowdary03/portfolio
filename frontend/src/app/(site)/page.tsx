import Link from "next/link";

import { EmbeddingField } from "@/components/home/EmbeddingField";
import { ProjectCard } from "@/components/home/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { getProjects } from "@/lib/content";

const FEATURED_SLUGS = ["ai-portfolio", "ai-job-search-platform", "mental-health-nlp"];

const STATS = [
  { value: "91.8%", label: "DistilBERT accuracy" },
  { value: "5,000/s", label: "Kafka event throughput" },
  { value: "3.9", label: "MS GPA, UMass Boston" },
  { value: "55", label: "students taught LLMs" },
  { value: "500+", label: "LeetCode solved" },
];

const TECH =
  "Python · PyTorch · LangGraph · RAG · OpenAI · Hugging Face · FastAPI · Next.js · TypeScript · Kafka · AWS · Docker · Terraform";

const SKILL_GROUPS = [
  {
    title: "Machine learning & AI",
    items:
      "NLP, LLMs, RAG, agents, prompt engineering, embeddings, model evaluation, PyTorch, Transformers, Scikit-learn",
  },
  {
    title: "Backend & APIs",
    items: "FastAPI, REST, Spring Boot, Spring Kafka, Node.js, SQLAlchemy",
  },
  {
    title: "Data & cloud",
    items: "PostgreSQL, MongoDB, ChromaDB, AWS (EC2, S3, Lambda, RDS), SQLite",
  },
  {
    title: "Infra & DevOps",
    items: "Docker, Kubernetes, Terraform, GitHub Actions, Prometheus, Grafana",
  },
];

const TIMELINE = [
  {
    period: "Sep 2025 — May 2026",
    title: "Teaching Fellow / Instructor · UMass Boston",
    detail:
      "Designed and taught IT110 & CS188sl to 55 students: Python, Java OOP, REST APIs, algorithms — and hands-on LLM engineering (LangChain, RAG, agents, n8n).",
  },
  {
    period: "Aug 2024 — May 2026",
    title: "MS Computer Science · University of Massachusetts Boston",
    detail: "GPA 3.9/4.0. Focus: machine learning & natural language processing.",
  },
  {
    period: "Aug 2020 — May 2024",
    title: "BE Computer Science · RMK Engineering College",
    detail: "GPA 3.38/4.0.",
  },
];

export default function Home() {
  const projects = getProjects();
  const featured = FEATURED_SLUGS.map((slug) =>
    projects.find((p) => p.slug === slug)
  ).filter((p) => p !== undefined);

  return (
    <main>
      {/* Hero — left-aligned, editorial */}
      <section className="blueprint relative overflow-hidden border-b border-border-soft">
        <EmbeddingField />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-24 sm:pb-28 sm:pt-32">
          <Reveal>
            <p className="microlabel">AI/ML Engineer — GenAI &amp; LLM systems</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mt-5 max-w-3xl text-4xl font-semibold sm:text-6xl">
              I build production AI systems — and the evaluation layers that
              keep them <span className="text-accent">honest.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
              Sai Srikar Chowdary Pattipati. MS Computer Science (ML/NLP),
              UMass Boston. I ship end-to-end LLM products: RAG pipelines,
              agent architectures, fine-tuned transformers, and the data
              infrastructure underneath. This site is one of them.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/chat"
              className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#d4d4d4]"
            >
              Ask my AI assistant
            </Link>
            <Link
              href="/projects"
              className="rounded-md border border-border-soft px-6 py-3 text-sm font-medium transition-colors hover:border-foreground"
            >
              View my work
            </Link>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="microlabel mt-10 max-w-2xl leading-relaxed">{TECH}</p>
          </Reveal>
        </div>
      </section>

      {/* Stats — ruled data row */}
      <section className="border-b border-border-soft">
        <div className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-5">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-5 py-7 ${i > 0 ? "sm:border-l sm:border-border-soft" : ""} ${
                i % 2 === 1 ? "border-l border-border-soft sm:border-l" : ""
              }`}
            >
              <Reveal delay={i * 0.05}>
                <p className="font-mono text-2xl font-medium tracking-tight">
                  {stat.value}
                </p>
                <p className="microlabel mt-1.5">{stat.label}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* Featured work — index rows */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal className="mb-8 flex items-baseline justify-between">
          <h2 className="microlabel">01 — Selected work</h2>
          <Link
            href="/projects"
            className="microlabel transition-colors hover:!text-accent"
          >
            All projects →
          </Link>
        </Reveal>
        <div>
          {featured.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.05}>
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Meta panel */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Reveal>
          <div className="border border-border-soft p-8 sm:p-10">
            <p className="microlabel">02 — About this site</p>
            <h2 className="display mt-4 max-w-xl text-2xl font-semibold">
              This portfolio is itself an AI system I built end to end.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              A RAG pipeline over my real documents, a LangGraph agent with a
              groundedness gate, and source citations on every answer —
              designed, evaluated, and deployed by me.
            </p>
            <Link
              href="/how-it-works"
              className="microlabel mt-6 inline-block border border-border-soft px-5 py-3 !text-foreground transition-colors hover:border-foreground"
            >
              See the architecture →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Skills — definition rows */}
      <section className="border-t border-border-soft">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <h2 className="microlabel mb-8">03 — Skills</h2>
          </Reveal>
          <div>
            {SKILL_GROUPS.map((group, i) => (
              <Reveal key={group.title} delay={i * 0.04}>
                <div className="grid gap-2 border-t border-border-soft py-5 last:border-b sm:grid-cols-[220px_1fr] sm:gap-8">
                  <h3 className="text-sm font-medium">{group.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{group.items}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Experience & education */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <h2 className="microlabel mb-8">04 — Experience &amp; education</h2>
        </Reveal>
        <div>
          {TIMELINE.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.04}>
              <div className="grid gap-2 border-t border-border-soft py-6 last:border-b sm:grid-cols-[220px_1fr] sm:gap-8">
                <p className="microlabel pt-0.5">{item.period}</p>
                <div>
                  <h3 className="text-[15px] font-medium">{item.title}</h3>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
                    {item.detail}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-border-soft">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <p className="microlabel">05 — Contact</p>
            <h2 className="display mt-4 max-w-2xl text-3xl font-semibold">
              Hiring for GenAI / LLM engineering?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              F-1 OPT · open to any location and remote · available May 2026.
              Ask my assistant the hard questions first, then let&apos;s talk.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="mailto:S.Pattipati002@umb.edu"
                className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#d4d4d4]"
              >
                Email me
              </a>
              <Link
                href="/resume"
                className="rounded-md border border-border-soft px-6 py-3 text-sm font-medium transition-colors hover:border-foreground"
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
