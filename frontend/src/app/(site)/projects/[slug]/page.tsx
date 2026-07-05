import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/site/Markdown";
import { getProject, getProjects } from "@/lib/content";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const project = getProject((await params).slug);
  return { title: project ? `${project.title} — Srikar Pattipati` : "Project" };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link href="/projects" className="text-sm text-muted hover:text-foreground">
        ← All projects
      </Link>
      <h1 className="mt-4 text-balance text-3xl font-bold leading-tight">
        {project.title}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border-soft bg-surface-2/70 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-muted"
          >
            {tag}
          </span>
        ))}
        {project.links.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-sm text-cyan hover:underline"
          >
            GitHub ↗
          </a>
        )}
      </div>

      <div className="mt-10">
        <Markdown>{project.body}</Markdown>
      </div>

      <div className="mt-12 rounded-2xl border border-accent/30 bg-accent-soft/40 p-6 text-center">
        <p className="text-sm text-muted">Want the interactive version?</p>
        <Link
          href={`/chat?q=${encodeURIComponent(`Tell me about the project "${project.title}" in detail.`)}`}
          data-testid="ask-ai-about-project"
          className="orb mt-3 inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:brightness-110"
        >
          Ask my AI about this project ✦
        </Link>
      </div>
    </main>
  );
}
