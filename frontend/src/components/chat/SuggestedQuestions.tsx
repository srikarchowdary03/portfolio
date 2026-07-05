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
    <div className="grid gap-2 sm:grid-cols-2">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onPick(question)}
          className="group cursor-pointer rounded-2xl border border-border-soft bg-surface/80 px-4 py-3.5 text-left text-sm text-foreground/85 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-accent/70 hover:bg-surface-2 hover:shadow-accent/10"
        >
          {question}
          <span className="ml-1.5 inline-block text-cyan opacity-0 transition-opacity group-hover:opacity-100">
            →
          </span>
        </button>
      ))}
    </div>
  );
}
