import ReactMarkdown from "react-markdown";

/** Prose renderer for content pages (projects, resume). Server-safe. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-content">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="mb-3 mt-10 border-b border-border-soft/60 pb-2 text-xl font-semibold first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-lg font-semibold">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-foreground/85">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1.5 pl-6 text-foreground/85">
              {children}
            </ul>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-cyan underline decoration-cyan/40 hover:decoration-cyan"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">
              {children}
            </code>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
