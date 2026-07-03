import fs from "fs";
import path from "path";

export interface KnowledgeChunk {
  id: string;
  source: string;
  title: string;
  heading: string;
  text: string;
}

const KB_DIR = path.join(process.cwd(), "content", "kb");

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Splits a markdown doc into chunks along H2 boundaries. The H1 preamble
 * (if it has real content beyond a one-line summary) becomes its own chunk
 * so intro material is still retrievable.
 */
export function chunkMarkdown(source: string, raw: string): KnowledgeChunk[] {
  const lines = raw.split("\n");
  const chunks: KnowledgeChunk[] = [];

  let docTitle = titleCase(source);
  let currentHeading = "Overview";
  let buffer: string[] = [];
  let chunkIndex = 0;

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text.length > 0) {
      chunks.push({
        id: `${source}#${chunkIndex}`,
        source,
        title: docTitle,
        heading: currentHeading,
        text,
      });
      chunkIndex += 1;
    }
    buffer = [];
  };

  for (const line of lines) {
    const h1 = /^#\s+(.*)/.exec(line);
    const h2 = /^##\s+(.*)/.exec(line);
    if (h1) {
      docTitle = h1[1].trim();
      continue;
    }
    if (h2) {
      flush();
      currentHeading = h2[1].trim();
      continue;
    }
    buffer.push(line);
  }
  flush();

  return chunks;
}

let cache: KnowledgeChunk[] | null = null;

export function loadKnowledgeBase(): KnowledgeChunk[] {
  if (cache) return cache;

  const files = fs.readdirSync(KB_DIR).filter((f) => f.endsWith(".md"));
  const chunks: KnowledgeChunk[] = [];

  for (const file of files) {
    const source = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(KB_DIR, file), "utf-8");
    chunks.push(...chunkMarkdown(source, raw));
  }

  cache = chunks;
  return chunks;
}
