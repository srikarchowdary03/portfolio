import type { Metadata } from "next";

import { Reveal } from "@/components/site/Reveal";
import { getReleases } from "@/lib/content";

export const metadata: Metadata = {
  title: "Releases — SRIKAR v3.0-beta",
  description: "Career changelog: every release from v1.0 to v3.0-beta.",
};

export default function ChangelogPage() {
  const releases = getReleases();
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Reveal>
        <p className="microlabel">Release history</p>
        <h1 className="display mt-3 text-3xl font-semibold">Changelog</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Every version since initial release. This document is also part of
          the demo&apos;s knowledge base — ask it to walk you through any release.
        </p>
      </Reveal>
      <div className="mt-12 border-l border-border-soft">
        {releases.map((release, i) => (
          <Reveal key={release.version} delay={i * 0.03}>
            <div className="relative pb-10 pl-8" data-testid="release-entry">
              <span
                className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 ${
                  i === 0 ? "bg-accent" : "bg-border-soft"
                }`}
                aria-hidden
              />
              <p className="font-mono text-sm font-semibold text-accent">{release.version}</p>
              <h2 className="mt-1 text-lg font-semibold">{release.title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/80">
                {release.body.replace(/\n+/g, " ")}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
