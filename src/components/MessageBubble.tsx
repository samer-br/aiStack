import type { ChatMessage, Citation } from "@/lib/types";

interface DisplayMessage extends ChatMessage {
  citations?: Citation[];
  pending?: boolean;
}

export function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
        }`}
      >
        {message.content}
        {message.pending ? <span className="streaming-cursor">▍</span> : null}
      </div>
      {!isUser && message.citations && message.citations.length > 0 ? (
        <div className="mt-2 flex max-w-[85%] flex-wrap gap-1.5">
          {message.citations.map((c, i) => (
            <span
              key={`${c.source}-${i}`}
              title={c.text}
              className="cursor-default rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400"
            >
              [{i + 1}] {c.title} - {c.heading}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
