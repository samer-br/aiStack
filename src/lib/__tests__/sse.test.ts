import { formatSSE } from "../sse";

describe("formatSSE", () => {
  it("formats an event name and JSON-encoded data frame", () => {
    const frame = formatSSE("delta", { text: "hello" });
    expect(frame).toBe('event: delta\ndata: {"text":"hello"}\n\n');
  });

  it("terminates every frame with a blank line", () => {
    const frame = formatSSE("done", {});
    expect(frame.endsWith("\n\n")).toBe(true);
  });
});
