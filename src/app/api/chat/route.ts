import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runChat } from "@/lib/chatEngine";
import { checkRateLimit } from "@/lib/rateLimit";
import { formatSSE } from "@/lib/sse";
import type { ChatMessage } from "@/lib/anthropic";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;

function isValidMessages(body: unknown): body is { messages: ChatMessage[] } {
  if (typeof body !== "object" || body === null || !("messages" in body)) {
    return false;
  }
  const messages = (body as { messages: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return false;
  }
  return messages.every(
    (m) =>
      typeof m === "object" &&
      m !== null &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.length > 0 &&
      m.content.length <= MAX_MESSAGE_LENGTH,
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rateLimitKey = session.user.email ?? session.user.name ?? "anonymous";
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isValidMessages(body)) {
    return new Response(JSON.stringify({ error: "Invalid messages payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runChat(body.messages)) {
          if (event.type === "citations") {
            controller.enqueue(
              encoder.encode(formatSSE("citations", event.citations)),
            );
          } else if (event.type === "delta") {
            controller.enqueue(encoder.encode(formatSSE("delta", { text: event.text })));
          } else if (event.type === "done") {
            controller.enqueue(encoder.encode(formatSSE("done", {})));
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(encoder.encode(formatSSE("error", { message })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
