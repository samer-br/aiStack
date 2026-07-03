export interface BM25Document {
  id: string;
  text: string;
}

interface IndexedDoc {
  id: string;
  termFreq: Map<string, number>;
  length: number;
}

export interface BM25Index {
  docs: IndexedDoc[];
  docFreq: Map<string, number>;
  avgDocLength: number;
  docCount: number;
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has",
  "how", "in", "is", "it", "its", "of", "on", "or", "that", "the", "to",
  "was", "what", "when", "where", "which", "who", "will", "with", "do",
  "does", "can", "i",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

const K1 = 1.5;
const B = 0.75;

export function buildBM25Index(documents: BM25Document[]): BM25Index {
  const docs: IndexedDoc[] = [];
  const docFreq = new Map<string, number>();
  let totalLength = 0;

  for (const doc of documents) {
    const tokens = tokenize(doc.text);
    const termFreq = new Map<string, number>();
    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) ?? 0) + 1);
    }
    for (const term of termFreq.keys()) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
    docs.push({ id: doc.id, termFreq, length: tokens.length });
    totalLength += tokens.length;
  }

  return {
    docs,
    docFreq,
    avgDocLength: documents.length > 0 ? totalLength / documents.length : 0,
    docCount: documents.length,
  };
}

export interface ScoredResult {
  id: string;
  score: number;
}

export function bm25Search(
  index: BM25Index,
  query: string,
  topK = 5,
): ScoredResult[] {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0 || index.docCount === 0) return [];

  const scores: ScoredResult[] = index.docs.map((doc) => {
    let score = 0;
    for (const term of queryTerms) {
      const df = index.docFreq.get(term) ?? 0;
      if (df === 0) continue;
      const idf = Math.log(
        1 + (index.docCount - df + 0.5) / (df + 0.5),
      );
      const tf = doc.termFreq.get(term) ?? 0;
      if (tf === 0) continue;
      const denom =
        tf + K1 * (1 - B + (B * doc.length) / (index.avgDocLength || 1));
      score += idf * ((tf * (K1 + 1)) / denom);
    }
    return { id: doc.id, score };
  });

  return scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
