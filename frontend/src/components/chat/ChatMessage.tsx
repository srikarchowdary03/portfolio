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
        <div className="max-w-[85%] rounded-3xl rounded-br-md bg-gradient-to-br from-accent/90 to-accent/60 px-5 py-3 text-sm leading-relaxed text-white shadow-lg shadow-accent/10">
          {message.content}
        </div>
      </div>
    );
  }

  const findSource = (n: number) =>
    message.sources?.find((s) => s.n === n) ?? null;

  return (
    <div className="rise flex items-start gap-3">
      <div className="orb mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white shadow-lg shadow-accent/30">
        S
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <div
          className={`rounded-3xl rounded-tl-md border px-5 py-4 text-sm leading-relaxed shadow-xl shadow-black/20 ${
            message.status === "error"
              ? "border-red-900/60 bg-red-950/30 text-red-200"
              : "border-border-soft/70 bg-surface/90"
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
                          className="mx-0.5 inline-flex h-4.5 min-w-4.5 translate-y-[-2px] cursor-pointer items-center justify-center rounded-full bg-accent/25 px-1 align-middle text-[10px] font-semibold text-cyan transition-colors hover:bg-accent/60 hover:text-white"
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
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-border-soft/60 pt-3">
              <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
                Sources
              </span>
              {message.sources.map((source) => (
                <button
                  key={source.n}
                  type="button"
                  onClick={() => onOpenSource(source)}
                  className="cursor-pointer rounded-full border border-border-soft bg-surface-2/80 px-2.5 py-0.5 text-[11px] text-foreground/75 transition-colors hover:border-accent hover:text-cyan"
                >
                  <span className="text-cyan">{source.n}</span> · {source.title}
                </button>
              ))}
            </div>
          )}

          {message.status === "done" && message.meta && (
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted">
                {message.meta.grounded ? (
                  <span className="text-emerald-400/80">✓ grounded</span>
                ) : (
                  <span className="text-amber-400/80">⚠ partially grounded</span>
                )}{" "}
                · {(message.meta.latency_ms / 1000).toFixed(1)}s ·{" "}
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
            <div className="flex flex-wrap gap-2" data-testid="followups">
              {message.followups.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => onAskFollowup(question)}
                  className="cursor-pointer rounded-full border border-border-soft bg-surface/70 px-3.5 py-1.5 text-xs text-foreground/80 transition-all hover:-translate-y-px hover:border-accent hover:text-cyan"
                >
                  <span className="mr-1 text-cyan">↳</span>
                  {question}
                </button>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
