// Minimal SSE parsing over fetch. The native EventSource API cannot send a
// POST body, so we read the response stream ourselves and split it into
// events. parseSSEBuffer is pure so it can be unit-tested without a network.

export interface SSEEvent {
  event: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

/**
 * Extract complete SSE frames ("event: x\ndata: {...}\n\n") from a buffer.
 * Returns the parsed events plus the unconsumed tail (a partial frame that
 * is still streaming in).
 */
export function parseSSEBuffer(buffer: string): { events: SSEEvent[]; rest: string } {
  const frames = buffer.split("\n\n");
  const rest = frames.pop() ?? ""; // last piece is incomplete (or empty)
  const events: SSEEvent[] = [];

  for (const frame of frames) {
    let event = "message";
    let data = "";
    for (const line of frame.split("\n")) {
      if (line.startsWith("event: ")) event = line.slice(7).trim();
      else if (line.startsWith("data: ")) data += line.slice(6);
    }
    if (!data) continue;
    try {
      events.push({ event, data: JSON.parse(data) });
    } catch {
      // Skip malformed frames rather than killing the stream.
    }
  }
  return { events, rest };
}

export async function* streamSSE(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<SSEEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseSSEBuffer(buffer);
      buffer = rest;
      yield* events;
    }
  } finally {
    reader.releaseLock();
  }
}
