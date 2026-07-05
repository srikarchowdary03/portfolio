"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { SourcePanel } from "@/components/chat/SourcePanel";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";
import { useChat } from "@/lib/useChat";
import type { Source } from "@/lib/types";

export default function ChatPage() {
  const { messages, send, isStreaming } = useChat();
  const [openSource, setOpenSource] = useState<Source | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-dvh flex-col">
      <header className="border-b border-border-soft bg-surface/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <Link href="/" className="text-sm text-muted hover:text-foreground">
              ← Sai Srikar Chowdary Pattipati
            </Link>
            <h1 className="text-base font-semibold">
              AI Recruiter Assistant
              <span className="ml-2 rounded-full border border-border-soft bg-surface-2 px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-cyan">
                grounded · cited
              </span>
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="my-auto space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-2xl font-semibold">
                Ask me anything about Srikar
              </p>
              <p className="mx-auto max-w-md text-sm text-muted">
                Every answer is retrieved from his real resume, project docs,
                and hiring FAQ — with citations you can inspect. I&apos;ll say so
                when I don&apos;t know something.
              </p>
            </div>
            <SuggestedQuestions onPick={send} />
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onOpenSource={setOpenSource}
            />
          ))
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="border-t border-border-soft bg-surface/60 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <ChatInput onSend={send} disabled={isStreaming} />
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
