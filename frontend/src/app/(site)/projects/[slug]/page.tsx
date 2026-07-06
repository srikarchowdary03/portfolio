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
      <Link
        href="/projects"
        className="microlabel transition-colors hover:!text-foreground"
      >
        ← All projects
      </Link>
      <h1 className="display mt-6 text-balance text-3xl font-semibold">
        {project.title}
      </h1>
      <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-border-soft pb-5">
        <p className="microlabel">{project.tags.join(" · ")}</p>
        {project.links.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noreferrer"
            className="microlabel ml-auto !text-accent hover:underline"
          >
            GitHub ↗
          </a>
        )}
      </div>

      <div className="mt-10">
        <Markdown>{project.body}</Markdown>
      </div>

      <div className="mt-14 border border-border-soft bg-surface p-7">
        <p className="microlabel">Interactive version</p>
        <p className="mt-2 text-sm text-muted">
          My AI assistant can answer follow-up questions about this project —
          with citations.
        </p>
        <Link
          href={`/chat?q=${encodeURIComponent(`Tell me about the project "${project.title}" in detail.`)}`}
          data-testid="ask-ai-about-project"
          className="btn-primary mt-4 inline-block px-5 py-2.5"
        >
          Ask my AI about this project
        </Link>
      </div>
    </main>
  );
}
