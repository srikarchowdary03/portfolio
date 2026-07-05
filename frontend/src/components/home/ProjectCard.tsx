import Link from "next/link";

import type { ContentDoc } from "@/lib/content-types";

/** Editorial index row (replaces the old card): number, title, tags, year. */
export function ProjectCard({
  project,
  index,
}: {
  project: ContentDoc;
  index?: number;
}) {
  const summary =
    project.body
      .split("## Problem")[1]
      ?.split("##")[0]
      ?.trim()
      .replace(/\n+/g, " ")
      .slice(0, 150) ?? "";
  const year = project.date?.slice(0, 4) ?? "";

  return (
    <Link
      href={`/projects/${project.slug}`}
      data-testid="project-card"
      className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-5 gap-y-1 border-t border-border-soft py-5 transition-colors last:border-b hover:bg-surface sm:grid-cols-[3rem_1fr_auto_2rem]"
    >
      {index !== undefined && (
        <span className="microlabel pt-0.5">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="text-[15px] font-medium leading-snug transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        {summary && (
          <p className="mt-1.5 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted">
            {summary}…
          </p>
        )}
        <p className="microlabel mt-2">{project.tags.slice(0, 4).join(" · ")}</p>
      </div>
      <span className="microlabel hidden sm:block">{year}</span>
      <span className="hidden text-muted transition-colors group-hover:text-accent sm:block">
        →
      </span>
    </Link>
  );
}
