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
          className="cursor-pointer rounded-xl border border-border-soft bg-surface px-4 py-3 text-left text-sm text-foreground/85 transition-colors hover:border-accent hover:bg-surface-2"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
