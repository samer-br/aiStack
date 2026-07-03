import { retrieve, buildContextBlock, type Citation } from "./retrieval";
import { streamAssistantReply, type ChatMessage } from "./anthropic";

export const SYSTEM_PROMPT_BASE = `You are the Nimbus documentation assistant. Answer
questions about the Nimbus platform using only the reference material provided
below. If the reference material does not cover the question, say so plainly
instead of guessing. Keep answers concise and cite sources by their bracketed
number, e.g. [1], inline where relevant.`;

export function buildSystemPrompt(contextBlock: string): string {
  if (!contextBlock) {
    return `${SYSTEM_PROMPT_BASE}\n\nNo reference material was found for this question.`;
  }
  return `${SYSTEM_PROMPT_BASE}\n\nReference material:\n${contextBlock}`;
}

export type ChatEvent =
  | { type: "citations"; citations: Citation[] }
  | { type: "delta"; text: string }
  | { type: "done" };

export interface ChatEngineDeps {
  streamReply: typeof streamAssistantReply;
  retrieveFn: typeof retrieve;
}

function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}

/**
 * Canned, retrieval-grounded response used when no ANTHROPIC_API_KEY is
 * configured, so the full retrieval + streaming + citations flow can be
 * exercised locally without an API key.
 */
async function* mockAssistantReply(
  citations: Citation[],
  query: string,
): AsyncGenerator<string> {
  const body =
    citations.length > 0
      ? `Based on the Nimbus docs, here's what's relevant to "${query}":\n\n` +
        citations.map((c, i) => `[${i + 1}] ${c.heading} (${c.title}): ${c.text}`).join("\n\n")
      : `I couldn't find anything in the Nimbus docs about "${query}".`;

  const notice =
    "\n\n[Local demo mode: no ANTHROPIC_API_KEY is set, so this is a canned " +
    "response assembled from retrieval results rather than a model-generated answer.]";

  for (const word of `${body}${notice}`.split(" ")) {
    yield `${word} `;
  }
}

function defaultStreamReply(
  citations: Citation[],
  query: string,
): typeof streamAssistantReply {
  if (process.env.ANTHROPIC_API_KEY) return streamAssistantReply;
  return () => mockAssistantReply(citations, query);
}

export async function* runChat(
  messages: ChatMessage[],
  deps: Partial<ChatEngineDeps> = {},
): AsyncGenerator<ChatEvent> {
  const retrieveFn = deps.retrieveFn ?? retrieve;

  const query = lastUserMessage(messages);
  const citations = retrieveFn(query);
  const system = buildSystemPrompt(buildContextBlock(citations));
  const streamReply = deps.streamReply ?? defaultStreamReply(citations, query);

  yield { type: "citations", citations };

  for await (const text of streamReply({ system, messages })) {
    yield { type: "delta", text };
  }

  yield { type: "done" };
}
