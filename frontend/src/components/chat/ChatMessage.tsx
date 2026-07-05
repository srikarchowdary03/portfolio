"use client";

import ReactMarkdown from "react-markdown";

import { citationNumberFromHref, linkifyCitations } from "@/lib/citations";
import type { ChatMessage as Message, Source } from "@/lib/types";
import { FeedbackButtons } from "./FeedbackButtons";
import { TypingIndicator } from "./TypingIndicator";

interface Props {
  message: Message;
  isLatest: boolean;
  onOpenSource: (source: Source) => void;
  onAskFollowup: (question: string) => void;
}

export function ChatMessage({ message, isLatest, onOpenSource, onAskFollowup }: Props) {
  if (message.role === "user") {
    return (
      <div className="rise flex justify-end">
        <div className="max-w-[85%] rounded-md bg-foreground px-4 py-2.5 text-sm leading-relaxed text-background">
          {message.content}
        </div>
      </div>
    );
  }

  const findSource = (n: number) =>
    message.sources?.find((s) => s.n === n) ?? null;

  return (
    <div className="rise flex items-start gap-3">
      <div className="microlabel mt-1 flex h-7 w-7 shrink-0 items-center justify-center border border-border-soft !text-muted">
        AI
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <div
          className={`border px-5 py-4 text-sm leading-relaxed ${
            message.status === "error"
              ? "border-red-900/70 bg-red-950/20 text-red-200"
              : "border-border-soft bg-surface"
          }`}
          data-testid="assistant-message"
        >
          {message.content === "" && message.status === "streaming" ? (
            <TypingIndicator />
          ) : (
            <div
              className={`chat-markdown text-foreground/90 ${
                message.status === "streaming" ? "streaming-caret" : ""
              }`}
            >
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
                          className="mx-0.5 inline-flex translate-y-[-3px] cursor-pointer items-center font-mono text-[10px] font-semibold text-accent hover:underline"
                        >
                          [{n}]
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
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1.5 border-t border-border-soft pt-3">
              <span className="microlabel">Sources</span>
              {message.sources.map((source) => (
                <button
                  key={source.n}
                  type="button"
                  onClick={() => onOpenSource(source)}
                  className="cursor-pointer font-mono text-[11px] text-muted transition-colors hover:text-accent"
                >
                  [{source.n}] {source.title}
                </button>
              ))}
            </div>
          )}

          {message.status === "done" && message.meta && (
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <span className="microlabel">
                {message.meta.grounded ? "grounded" : "partially grounded"} ·{" "}
                {(message.meta.latency_ms / 1000).toFixed(1)}s ·{" "}
                {message.meta.used}/{message.meta.retrieved} sources
              </span>
              {message.meta.turn_id != null && (
                <FeedbackButtons turnId={message.meta.turn_id} />
              )}
            </div>
          )}
        </div>

        {isLatest &&
          message.status === "done" &&
          message.followups &&
          message.followups.length > 0 && (
            <div className="flex flex-col items-start gap-1.5" data-testid="followups">
              {message.followups.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => onAskFollowup(question)}
                  className="cursor-pointer text-[13px] text-muted transition-colors hover:text-accent"
                >
                  <span className="mr-1.5 font-mono text-accent-dim">↳</span>
                  {question}
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
