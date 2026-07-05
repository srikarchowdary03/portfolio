"use client";

import { useState } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
  prefill?: string;
}

export function ChatInput({ onSend, disabled, prefill }: Props) {
  const [value, setValue] = useState(prefill ?? "");

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="flex items-end gap-2 border border-border-soft bg-surface p-2 transition-colors focus-within:border-muted">
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
        className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted/70"
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="cursor-pointer rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#d4d4d4] disabled:cursor-not-allowed disabled:opacity-30"
      >
        Send
      </button>
    </div>
  );
}
