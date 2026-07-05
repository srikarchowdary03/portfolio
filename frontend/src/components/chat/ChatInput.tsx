"use client";

import { useState } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-border-soft bg-surface/95 p-2 shadow-2xl shadow-black/30 transition-shadow focus-within:border-accent/70 focus-within:shadow-accent/10">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
        maxLength={2000}
        placeholder="Ask about Srikar's experience, projects, skills…"
        aria-label="Message the AI assistant"
        className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="orb cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
      >
        Send
      </button>
    </div>
  );
}
