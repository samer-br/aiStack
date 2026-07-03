import { buildBM25Index, bm25Search, type BM25Index } from "./bm25";
import { loadKnowledgeBase, type KnowledgeChunk } from "./kb";
import type { Citation } from "./types";

export type { Citation };

let indexCache: { index: BM25Index; chunks: KnowledgeChunk[] } | null = null;

function getIndex() {
  if (indexCache) return indexCache;
  const chunks = loadKnowledgeBase();
  const index = buildBM25Index(chunks.map((c) => ({ id: c.id, text: c.text })));
  indexCache = { index, chunks };
  return indexCache;
}

export function retrieve(query: string, topK = 4): Citation[] {
  const { index, chunks } = getIndex();
  const results = bm25Search(index, query, topK);
  const byId = new Map(chunks.map((c) => [c.id, c]));

  return results
    .map((r) => {
      const chunk = byId.get(r.id);
      if (!chunk) return null;
      return {
        source: chunk.source,
        title: chunk.title,
        heading: chunk.heading,
        text: chunk.text,
        score: r.score,
      };
    })
    .filter((c): c is Citation => c !== null);
}

export function buildContextBlock(citations: Citation[]): string {
  if (citations.length === 0) return "";
  return citations
    .map(
      (c, i) =>
        `[${i + 1}] ${c.title} - ${c.heading}\n${c.text}`,
    )
    .join("\n\n");
}

const SUGGESTED_QUESTIONS = [
  "How does autoscaling work for compute services?",
  "What storage classes are available and what do they cost?",
  "How do I attach a custom domain?",
  "What happens if I exceed my API rate limit?",
];

export function getSuggestedQuestions(): string[] {
  return SUGGESTED_QUESTIONS;
}
