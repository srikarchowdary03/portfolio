"use client";

import { useState } from "react";

import { API_BASE_URL } from "@/lib/config";

export function FeedbackButtons({ turnId }: { turnId: number }) {
  const [selected, setSelected] = useState<"up" | "down" | null>(null);

  const submit = (rating: "up" | "down") => {
    if (selected) return;
    setSelected(rating);
    // Fire-and-forget: feedback must never interrupt the conversation.
    fetch(`${API_BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turn_id: turnId, rating }),
    }).catch(() => {});
  };

  if (selected) {
    return <span className="microlabel">Thanks</span>;
  }

  return (
    <span className="microlabel flex items-baseline gap-2">
      Helpful?
      <button
        type="button"
        data-testid="feedback-up"
        onClick={() => submit("up")}
        className="cursor-pointer font-mono !text-foreground transition-colors hover:!text-accent"
      >
        Y
      </button>
      <span aria-hidden>/</span>
      <button
        type="button"
        data-testid="feedback-down"
        onClick={() => submit("down")}
        className="cursor-pointer font-mono !text-foreground transition-colors hover:!text-accent"
      >
        N
      </button>
    </span>
  );
}
