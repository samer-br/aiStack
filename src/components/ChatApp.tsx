"use client";

import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import type { ChatMessage, Citation } from "@/lib/types";
import { parseSSEStream } from "@/lib/sseClient";
import { MessageBubble } from "@/components/MessageBubble";
import { Composer } from "@/components/Composer";

interface DisplayMessage extends ChatMessage {
  citations?: Citation[];
  pending?: boolean;
}

export function ChatApp({
  userName,
  userImage,
  suggestedQuestions,
}: {
  userName: string;
  userImage: string | null;
  suggestedQuestions: string[];
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function sendMessage(content: string) {
    if (isStreaming || content.trim().length === 0) return;

    setError(null);
    const userMessage: DisplayMessage = { role: "user", content };
    const history = [...messages, userMessage];
    setMessages([...history, { role: "assistant", content: "", pending: true }]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content: c }) => ({ role, content: c })),
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(payload.error ?? `Request failed with status ${response.status}`);
      }

      let assistantText = "";
      let citations: Citation[] = [];

      for await (const event of parseSSEStream(response.body)) {
        if (event.event === "citations") {
          citations = JSON.parse(event.data) as Citation[];
          setMessages((prev) => updateLastAssistant(prev, { citations }));
        } else if (event.event === "delta") {
          const { text } = JSON.parse(event.data) as { text: string };
          assistantText += text;
          setMessages((prev) =>
            updateLastAssistant(prev, { content: assistantText, pending: false }),
          );
        } else if (event.event === "error") {
          const { message } = JSON.parse(event.data) as { message: string };
          throw new Error(message);
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setMessages((prev) => prev.filter((m) => !m.pending));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 dark:border-neutral-800">
        <div>
          <h1 className="text-sm font-semibold">AIStack</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Nimbus documentation assistant
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{userName}</span>
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt="" className="h-7 w-7 rounded-full" />
          ) : null}
          <button
            onClick={() => signOut()}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Ask about compute, storage, networking, security, or billing on Nimbus.
            </p>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-lg border border-neutral-200 px-4 py-3 text-left text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((message, i) => (
              <MessageBubble key={i} message={message} />
            ))}
          </div>
        )}
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        ) : null}
      </main>

      <div className="mx-auto w-full max-w-3xl px-4 pb-6">
        <Composer onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}

function updateLastAssistant(
  prev: DisplayMessage[],
  patch: Partial<DisplayMessage>,
): DisplayMessage[] {
  const next = [...prev];
  const lastIndex = next.length - 1;
  if (lastIndex >= 0 && next[lastIndex].role === "assistant") {
    next[lastIndex] = { ...next[lastIndex], ...patch };
  }
  return next;
}
