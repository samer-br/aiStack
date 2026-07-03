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

export async function* runChat(
  messages: ChatMessage[],
  deps: Partial<ChatEngineDeps> = {},
): AsyncGenerator<ChatEvent> {
  const retrieveFn = deps.retrieveFn ?? retrieve;
  const streamReply = deps.streamReply ?? streamAssistantReply;

  const query = lastUserMessage(messages);
  const citations = retrieveFn(query);
  const system = buildSystemPrompt(buildContextBlock(citations));

  yield { type: "citations", citations };

  for await (const text of streamReply({ system, messages })) {
    yield { type: "delta", text };
  }

  yield { type: "done" };
}
