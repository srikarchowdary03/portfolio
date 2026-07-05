"use client";

import type { Source } from "@/lib/types";

const DOC_TYPE_LABELS: Record<string, string> = {
  resume: "Resume",
  project: "Project documentation",
  experience: "Experience",
  skill: "Skills",
  faq: "Hiring FAQ",
  profile: "Profile",
  certification: "Certifications",
  system: "System documentation",
};

interface Props {
  source: Source | null;
  onClose: () => void;
}

export function SourcePanel({ source, onClose }: Props) {
  if (!source) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close source panel"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-black/60"
      />
      <aside
        data-testid="source-panel"
        className="slide-in fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border-soft bg-background"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-soft p-5">
          <div>
            <p className="microlabel !text-accent">
              {DOC_TYPE_LABELS[source.doc_type] ?? source.doc_type} — source [{source.n}]
            </p>
            <h2 className="mt-2 text-base font-semibold">{source.title}</h2>
            {source.heading && (
              <p className="microlabel mt-1.5">§ {source.heading}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="microlabel cursor-pointer rounded p-1 transition-colors hover:!text-foreground"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <p className="microlabel mb-3">
            Retrieved passage — what the AI actually read
          </p>
          <blockquote className="whitespace-pre-wrap border border-border-soft bg-surface p-4 font-mono text-[13px] leading-relaxed text-foreground/85">
            {source.excerpt}
            {source.excerpt.length >= 240 ? "…" : ""}
          </blockquote>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            From <code className="font-mono">{source.source_file}</code> in the
            knowledge base — the same markdown that renders this site.
          </p>
        </div>
      </aside>
    </>
  );
}
