"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/config";

const FALLBACK = [
  "Tell me about this candidate.",
  "What LLM experience does he have?",
  "Show me his NLP projects.",
  "Why should I hire him?",
];

export function SuggestedQuestions({ onPick }: { onPick: (q: string) => void }) {
  const [questions, setQuestions] = useState<string[]>(FALLBACK);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/chat/suggestions`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.suggestions?.length) setQuestions(data.suggestions);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="border border-border-soft bg-surface">
      {questions.map((question, i) => (
        <button
          key={question}
          type="button"
          onClick={() => onPick(question)}
          className={`group flex w-full cursor-pointer items-baseline gap-3 px-4 py-3.5 text-left text-sm text-foreground/85 transition-colors hover:bg-surface-2 ${
            i > 0 ? "border-t border-border-soft" : ""
          }`}
        >
          <span className="microlabel !text-accent">{String(i + 1).padStart(2, "0")}</span>
          <span className="flex-1">{question}</span>
          <span className="text-muted transition-colors group-hover:text-accent">→</span>
        </button>
      ))}
    </div>
  );
}
