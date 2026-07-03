import { runChat, buildSystemPrompt } from "../chatEngine";
import type { Citation, ChatMessage } from "../types";

async function* fakeStream(chunks: string[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
}

describe("buildSystemPrompt", () => {
  it("includes reference material when a context block is provided", () => {
    const prompt = buildSystemPrompt("[1] Doc - Heading\nsome text");
    expect(prompt).toContain("Reference material");
    expect(prompt).toContain("[1] Doc - Heading");
  });

  it("notes the absence of reference material when none is retrieved", () => {
    const prompt = buildSystemPrompt("");
    expect(prompt).toContain("No reference material was found");
  });
});

describe("runChat", () => {
  const citations: Citation[] = [
    {
      source: "compute",
      title: "Compute",
      heading: "Autoscaling",
      text: "Services scale based on CPU utilization.",
      score: 4.2,
    },
  ];

  it("emits citations, then deltas, then a done event, using injected dependencies", async () => {
    const messages: ChatMessage[] = [{ role: "user", content: "How does autoscaling work?" }];
    const retrieveFn = jest.fn().mockReturnValue(citations);
    const streamReply = jest.fn().mockImplementation(() => fakeStream(["Auto", "scaling ", "explained."]));

    const events = [];
    for await (const event of runChat(messages, { retrieveFn, streamReply })) {
      events.push(event);
    }

    expect(retrieveFn).toHaveBeenCalledWith("How does autoscaling work?");
    expect(events[0]).toEqual({ type: "citations", citations });
    expect(events.slice(1, -1)).toEqual([
      { type: "delta", text: "Auto" },
      { type: "delta", text: "scaling " },
      { type: "delta", text: "explained." },
    ]);
    expect(events[events.length - 1]).toEqual({ type: "done" });
  });

  it("retrieves using the most recent user message, not earlier turns", async () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "first question" },
      { role: "assistant", content: "first answer" },
      { role: "user", content: "second question" },
    ];
    const retrieveFn = jest.fn().mockReturnValue([]);
    const streamReply = jest.fn().mockImplementation(() => fakeStream([]));

    const events = [];
    for await (const event of runChat(messages, { retrieveFn, streamReply })) {
      events.push(event);
    }

    expect(retrieveFn).toHaveBeenCalledWith("second question");
  });
});
