import { parseSSEStream } from "../sseClient";
import { formatSSE } from "../sse";

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i < chunks.length) {
        controller.enqueue(encoder.encode(chunks[i]));
        i += 1;
      } else {
        controller.close();
      }
    },
  });
}

describe("parseSSEStream", () => {
  it("parses events split across multiple reads", async () => {
    const raw = formatSSE("citations", [{ source: "compute" }]) + formatSSE("delta", { text: "hi" });
    // split the raw frame stream at an arbitrary byte offset to simulate a
    // network read that lands mid-frame
    const mid = Math.floor(raw.length / 2);
    const stream = streamFromChunks([raw.slice(0, mid), raw.slice(mid)]);

    const events = [];
    for await (const event of parseSSEStream(stream)) {
      events.push(event);
    }

    expect(events).toEqual([
      { event: "citations", data: JSON.stringify([{ source: "compute" }]) },
      { event: "delta", data: JSON.stringify({ text: "hi" }) },
    ]);
  });

  it("ignores frames without a data field", async () => {
    const stream = streamFromChunks(["event: ping\n\n", formatSSE("done", {})]);
    const events = [];
    for await (const event of parseSSEStream(stream)) {
      events.push(event);
    }
    expect(events).toEqual([{ event: "done", data: "{}" }]);
  });
});
