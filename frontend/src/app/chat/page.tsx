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
      <header className="border-b border-border-soft bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <div>
            <Link
              href="/"
              className="microlabel transition-colors hover:!text-foreground"
            >
              ← Srikar Pattipati
            </Link>
            <div className="mt-1 flex items-baseline gap-3">
              <h1 className="font-mono text-[15px] font-semibold tracking-wide">
                SRIKAR <span className="text-accent">live demo</span>
              </h1>
              <span className="microlabel">grounded · cited</span>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              disabled={isStreaming}
              className="microlabel cursor-pointer border border-border-soft px-3 py-2 transition-colors hover:border-foreground hover:!text-foreground disabled:opacity-40"
            >
              New chat
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 overflow-y-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="my-auto space-y-8">
            <div>
              <p className="microlabel">Live demo — ask anything about the candidate</p>
              <p className="display mt-3 text-2xl font-semibold">
                Grounded answers, with the receipts.
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                I retrieve from his real resume, project docs, and hiring FAQ —
                every claim carries a citation you can inspect, and I say so
                when I don&apos;t know something.
              </p>
            </div>
            <SuggestedQuestions onPick={send} />
            <p className="microlabel">
              Powered by a RAG pipeline he built —{" "}
              <button
                type="button"
                onClick={() => send("How does the AI behind this portfolio work?")}
                className="cursor-pointer !text-accent hover:underline"
              >
                ask how it works
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

      <footer className="border-t border-border-soft bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3.5">
          <ChatInput onSend={send} disabled={isStreaming} prefill={prefill} />
          <p className="microlabel mt-2.5 text-center">
            Answers come only from Srikar&apos;s knowledge base ·{" "}
            <Link href="/" className="!text-foreground/70 underline underline-offset-4 hover:!text-foreground">
              back to portfolio
            </Link>
          </p>
        </div>
      </footer>

      <SourcePanel source={openSource} onClose={() => setOpenSource(null)} />
    </div>
  );
}
