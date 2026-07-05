import { describe, expect, it } from "vitest";

import { parseSSEBuffer } from "./sse";

describe("parseSSEBuffer", () => {
  it("parses complete frames and keeps the partial tail", () => {
    const buffer =
      'event: token\ndata: {"text": "Hello"}\n\n' +
      'event: token\ndata: {"text": " world"}\n\n' +
      'event: meta\ndata: {"latency';

    const { events, rest } = parseSSEBuffer(buffer);

    expect(events).toEqual([
      { event: "token", data: { text: "Hello" } },
      { event: "token", data: { text: " world" } },
    ]);
    expect(rest).toBe('event: meta\ndata: {"latency');
  });

  it("resumes cleanly when the tail completes on the next chunk", () => {
    const first = parseSSEBuffer('event: done\ndata: {');
    expect(first.events).toEqual([]);

    const second = parseSSEBuffer(first.rest + "}\n\n");
    expect(second.events).toEqual([{ event: "done", data: {} }]);
    expect(second.rest).toBe("");
  });

  it("skips malformed frames without dropping the rest", () => {
    const buffer =
      "event: broken\ndata: {not json}\n\n" +
      'event: token\ndata: {"text": "ok"}\n\n';

    const { events } = parseSSEBuffer(buffer);
    expect(events).toEqual([{ event: "token", data: { text: "ok" } }]);
  });
});
