"use client";

// Chat state + streaming. One hook owns the conversation: it POSTs to the
// backend, consumes the SSE stream, and updates the assistant message in
// place as token/sources/meta events arrive.

import { useCallback, useRef, useState } from "react";

import { API_BASE_URL } from "./config";
import { streamSSE } from "./sse";
import type { ChatMessage } from "./types";

const SESSION_KEY = "portfolio-chat-session";

function getSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const counter = useRef(0);

  const patchMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((current) =>
      current.map((m) =>
        m.id === id
          ? { ...m, ...patch, content: m.content + (patch.content ?? "") }
          : m
      )
    );
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userId = `msg-${counter.current++}`;
      const assistantId = `msg-${counter.current++}`;
      setMessages((current) => [
        ...current,
        { id: userId, role: "user", content: trimmed, status: "done" },
        { id: assistantId, role: "assistant", content: "", status: "streaming" },
      ]);
      setIsStreaming(true);

      try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: getSessionId(), message: trimmed }),
        });
        if (!response.ok || !response.body) {
          throw new Error(`Request failed (${response.status})`);
        }

        for await (const { event, data } of streamSSE(response.body)) {
          if (event === "token") {
            patchMessage(assistantId, { content: data.text });
          } else if (event === "sources") {
            patchMessage(assistantId, { sources: data.sources });
          } else if (event === "meta") {
            patchMessage(assistantId, { meta: data });
          } else if (event === "done") {
            patchMessage(assistantId, { status: "done" });
          } else if (event === "error") {
            patchMessage(assistantId, {
              content: data.message ?? "Something went wrong.",
              status: "error",
            });
          }
        }
      } catch {
        patchMessage(assistantId, {
          content: "I couldn't reach the assistant. Please try again in a moment.",
          status: "error",
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, patchMessage]
  );

  return { messages, send, isStreaming };
}
