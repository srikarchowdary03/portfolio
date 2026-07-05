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

  return (
    <span className="flex items-center gap-1">
      {(["up", "down"] as const).map((rating) => (
        <button
          key={rating}
          type="button"
          aria-label={rating === "up" ? "Helpful" : "Not helpful"}
          data-testid={`feedback-${rating}`}
          onClick={() => submit(rating)}
          disabled={selected !== null}
          className={`cursor-pointer rounded px-1 text-xs transition-opacity disabled:cursor-default ${
            selected === rating ? "opacity-100" : selected ? "opacity-25" : "opacity-55 hover:opacity-100"
          }`}
        >
          {rating === "up" ? "👍" : "👎"}
        </button>
      ))}
    </span>
  );
}
