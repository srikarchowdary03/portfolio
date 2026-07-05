export function Footer() {
  return (
    <footer className="border-t border-border-soft/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-center">
        <p className="text-sm text-muted">
          Sai Srikar Chowdary Pattipati · Boston, MA · open to remote &amp; relocation
        </p>
        <div className="flex items-center gap-4 text-sm">
          <a href="mailto:S.Pattipati002@umb.edu" className="text-cyan hover:underline">
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/srikar-chowdary-381314205"
            target="_blank"
            rel="noreferrer"
            className="text-cyan hover:underline"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/srikarchowdary03"
            target="_blank"
            rel="noreferrer"
            className="text-cyan hover:underline"
          >
            GitHub
          </a>
        </div>
        <p className="text-xs text-muted">
          This site is itself an AI system — RAG, LangGraph, and evals.{" "}
          <a
            href="https://github.com/srikarchowdary03/portfolio"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground"
          >
            Read the source
          </a>
        </p>
      </div>
    </footer>
  );
}
