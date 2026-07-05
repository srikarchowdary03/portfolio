"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { SourcePanel } from "@/components/chat/SourcePanel";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";
import { useChat } from "@/lib/useChat";
import type { Source } from "@/lib/types";

export default function ChatPage() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <ChatScreen />
    </Suspense>
  );
}

function ChatScreen() {
  // Deep links like /chat?q=... (project pages) prefill the input —
  // visitors keep control; nothing auto-sends.
  const prefill = useSearchParams().get("q") ?? undefined;
  const { messages, send, reset, isStreaming } = useChat();
  const [openSource, setOpenSource] = useState<Source | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <div className="flex h-dvh flex-col">
      <div className="ambient" />

      <header className="border-b border-border-soft/70 bg-surface/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to portfolio"
              className="orb flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg shadow-accent/25 transition-transform hover:scale-105"
            >
              S
            </Link>
            <div>
              <h1 className="text-[15px] font-semibold leading-tight">
                AI Recruiter Assistant
              </h1>
              <p className="text-xs text-muted">
                Sai Srikar Chowdary Pattipati · AI/ML Engineer
              </p>
            </div>
            <span className="ml-2 hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-400 sm:inline">
              grounded · cited
            </span>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              disabled={isStreaming}
              className="cursor-pointer rounded-lg border border-border-soft px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-foreground disabled:opacity-40"
            >
              + New chat
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 overflow-y-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="my-auto space-y-8">
            <div className="space-y-3 text-center">
              <div className="orb mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-xl shadow-accent/30">
                S
              </div>
              <p className="text-3xl font-semibold tracking-tight">
                Ask me anything <span className="gradient-text">about Srikar</span>
              </p>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
                I retrieve answers from his real resume, project docs, and
                hiring FAQ — every claim carries a citation you can inspect,
                and I say so when I don&apos;t know something.
              </p>
            </div>
            <SuggestedQuestions onPick={send} />
            <p className="text-center text-[11px] text-muted">
              Powered by a RAG pipeline he built — ask{" "}
              <button
                type="button"
                onClick={() => send("How does the AI behind this portfolio work?")}
                className="cursor-pointer text-cyan underline decoration-cyan/40 hover:decoration-cyan"
              >
                how it works
              </button>
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLatest={message.id === lastAssistantId}
              onOpenSource={setOpenSource}
              onAskFollowup={send}
            />
          ))
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="border-t border-border-soft/70 bg-surface/40 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3.5">
          <ChatInput onSend={send} disabled={isStreaming} prefill={prefill} />
          <p className="mt-2 text-center text-[11px] text-muted">
            Answers come only from Srikar&apos;s knowledge base ·{" "}
            <Link href="/" className="underline hover:text-foreground">
              back to portfolio
            </Link>
          </p>
        </div>
      </footer>

      <SourcePanel source={openSource} onClose={() => setOpenSource(null)} />
    </div>
  );
}
