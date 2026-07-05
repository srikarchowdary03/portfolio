import type { Metadata } from "next";

import { Markdown } from "@/components/site/Markdown";
import { Reveal } from "@/components/site/Reveal";
import { getDoc } from "@/lib/content";

export const metadata: Metadata = {
  title: "Resume — Srikar Pattipati",
  description: "Resume of Sai Srikar Chowdary Pattipati, AI/ML Engineer.",
};

export default function ResumePage() {
  const resume = getDoc("resume/resume.md");
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Resume</h1>
            <p className="mt-1 text-sm text-muted">
              The same document my AI assistant cites when you ask about me.
            </p>
          </div>
          <a
            href="/resume.pdf"
            download
            data-testid="resume-download"
            className="orb rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:brightness-110"
          >
            Download PDF ↓
          </a>
        </div>
      </Reveal>
      <div className="mt-10 rounded-3xl border border-border-soft bg-surface/60 p-6 sm:p-10">
        <Markdown>{resume.body}</Markdown>
      </div>
    </main>
  );
}
