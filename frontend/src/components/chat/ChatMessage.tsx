"use client";

import ReactMarkdown from "react-markdown";

import { citationNumberFromHref, linkifyCitations } from "@/lib/citations";
import type { ChatMessage as Message, Source } from "@/lib/types";
import { FeedbackButtons } from "./FeedbackButtons";
import { TypingIndicator } from "./TypingIndicator";

interface Props {
  message: Message;
  onOpenSource: (source: Source) => void;
}

export function ChatMessage({ message, onOpenSource }: Props) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent-soft px-4 py-3 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  const findSource = (n: number) =>
    message.sources?.find((s) => s.n === n) ?? null;

  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[92%] rounded-2xl rounded-bl-sm border px-4 py-3 text-sm leading-relaxed ${
          message.status === "error"
            ? "border-red-900/60 bg-red-950/30 text-red-200"
            : "border-border-soft bg-surface"
        }`}
        data-testid="assistant-message"
      >
        {message.content === "" && message.status === "streaming" ? (
          <TypingIndicator />
        ) : (
          <div className="chat-markdown text-foreground/90">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => {
                  const n = href ? citationNumberFromHref(href) : null;
                  const source = n ? findSource(n) : null;
                  if (n && source) {
                    return (
                      <button
                        type="button"
                        onClick={() => onOpenSource(source)}
                        title={source.title}
                        data-testid={`citation-${n}`}
                        className="mx-0.5 inline-flex h-4.5 min-w-4.5 translate-y-[-2px] cursor-pointer items-center justify-center rounded-full bg-accent/25 px-1 align-middle text-[10px] font-semibold text-cyan hover:bg-accent/50"
                      >
                        {n}
                      </button>
                    );
                  }
                  // Streaming edge: marker arrives before the sources event.
                  return <span>{n ? `[${n}]` : children}</span>;
                },
              }}
            >
              {linkifyCitations(message.content)}
            </ReactMarkdown>
          </div>
        )}

        {message.status === "done" && message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border-soft pt-2.5">
            <span className="mr-1 text-[11px] uppercase tracking-wide text-muted">
              Sources
            </span>
            {message.sources.map((source) => (
              <button
                key={source.n}
                type="button"
                onClick={() => onOpenSource(source)}
                className="cursor-pointer rounded-full border border-border-soft bg-surface-2 px-2.5 py-0.5 text-[11px] text-foreground/80 hover:border-accent hover:text-cyan"
              >
                [{source.n}] {source.title}
              </button>
            ))}
          </div>
        )}

        {message.status === "done" && message.meta && (
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-muted">
              {message.meta.grounded ? "✓ grounded" : "⚠ partially grounded"} ·{" "}
              {(message.meta.latency_ms / 1000).toFixed(1)}s ·{" "}
              {message.meta.used}/{message.meta.retrieved} sources used
            </span>
            {message.meta.turn_id != null && (
              <FeedbackButtons turnId={message.meta.turn_id} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
