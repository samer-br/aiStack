import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const githubConfigured = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);

export const isGuestModeEnabled = !githubConfigured;

export const authOptions: NextAuthOptions = {
  providers: githubConfigured
    ? [
        GitHubProvider({
          clientId: process.env.GITHUB_ID ?? "",
          clientSecret: process.env.GITHUB_SECRET ?? "",
        }),
      ]
    : [
        // No GitHub OAuth app configured: fall back to a guest session so
        // the app is runnable locally without setting up an OAuth app.
        CredentialsProvider({
          id: "guest",
          name: "Guest",
          credentials: {},
          async authorize() {
            return { id: "guest", name: "Guest" };
          },
        }),
      ],
  session: {
    strategy: "jwt",
  },
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "aistack-local-development-secret"),
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
};
