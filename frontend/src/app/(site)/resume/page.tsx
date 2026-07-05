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
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-soft pb-6">
          <div>
            <p className="microlabel">Document</p>
            <h1 className="display mt-2 text-3xl font-semibold">Resume</h1>
            <p className="mt-2 text-sm text-muted">
              The same document my AI assistant cites when you ask about me.
            </p>
          </div>
          <a
            href="/resume.pdf"
            download
            data-testid="resume-download"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#d4d4d4]"
          >
            Download PDF
          </a>
        </div>
      </Reveal>
      <div className="mt-10">
        <Markdown>{resume.body}</Markdown>
      </div>
    </main>
  );
}
