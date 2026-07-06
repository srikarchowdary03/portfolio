export function Footer() {
  return (
    <footer className="border-t border-border-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="microlabel">
            SRIKAR v3.0-beta is <span className="!text-foreground">Sai Srikar Chowdary Pattipati</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            Boston, MA — open to remote &amp; relocation. GA May 2026.
          </p>
          <p className="mt-1 text-sm text-muted">
            This site is itself an AI system: RAG, LangGraph, evals.{" "}
            <a
              href="https://github.com/srikarchowdary03/portfolio"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline decoration-accent-dim underline-offset-4 hover:decoration-accent"
            >
              Read the source
            </a>
          </p>
        </div>
        <div className="flex gap-6">
          {[
            ["Email", "mailto:S.Pattipati002@umb.edu"],
            ["LinkedIn", "https://www.linkedin.com/in/srikar-chowdary-381314205"],
            ["GitHub", "https://github.com/srikarchowdary03"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="microlabel transition-colors hover:!text-accent"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
