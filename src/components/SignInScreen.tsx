"use client";

import { signIn } from "next-auth/react";

export function SignInScreen({ mode }: { mode: "github" | "guest" }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">AIStack</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to chat with the Nimbus documentation assistant. Answers
            are grounded in the knowledge base and cite their sources.
          </p>
        </div>
        {mode === "github" ? (
          <button
            onClick={() => signIn("github")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <GitHubIcon />
            Continue with GitHub
          </button>
        ) : (
          <>
            <button
              onClick={() => signIn("guest")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Continue as Guest
            </button>
            <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
              No GitHub OAuth app configured, so sign-in falls back to a local
              guest session. Set GITHUB_ID and GITHUB_SECRET to enable real
              GitHub sign-in.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
      0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
      -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07
      -1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18
      1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
      1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38
      A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
