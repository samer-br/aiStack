"use client";

import { useState, type KeyboardEvent } from "react";

export function Composer({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (trimmed.length === 0 || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-950">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about Nimbus compute, storage, networking, security, or billing..."
        rows={1}
        disabled={disabled}
        className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-neutral-400 disabled:opacity-50"
      />
      <button
        onClick={submit}
        disabled={disabled || value.trim().length === 0}
        className="rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-40 dark:bg-white dark:text-neutral-900"
      >
        Send
      </button>
    </div>
  );
}
