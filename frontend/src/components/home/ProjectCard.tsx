import Link from "next/link";

import type { ContentDoc } from "@/lib/content-types";

export function ProjectCard({ project }: { project: ContentDoc }) {
  const summary =
    project.body
      .split("## Problem")[1]
      ?.split("##")[0]
      ?.trim()
      .replace(/\n+/g, " ")
      .slice(0, 180) ?? "";

  return (
    <Link
      href={`/projects/${project.slug}`}
      data-testid="project-card"
      className="group flex flex-col gap-3 rounded-2xl border border-border-soft bg-surface/80 p-5 shadow-lg shadow-black/10 transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-accent/10"
    >
      <h3 className="text-[15px] font-semibold leading-snug group-hover:text-cyan">
        {project.title}
      </h3>
      {summary && (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">
          {summary}…
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {project.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border-soft bg-surface-2/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
