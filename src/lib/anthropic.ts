import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "./types";

export type { ChatMessage };

export const DEFAULT_MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function* streamAssistantReply(params: {
  system: string;
  messages: ChatMessage[];
  model?: string;
}): AsyncGenerator<string> {
  const anthropic = getAnthropicClient();
  const stream = anthropic.messages.stream({
    model: params.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
    max_tokens: 1024,
    system: params.system,
    messages: params.messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
