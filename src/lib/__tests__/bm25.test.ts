import { buildBM25Index, bm25Search, tokenize } from "../bm25";

describe("tokenize", () => {
  it("lowercases, strips punctuation, and drops stopwords", () => {
    expect(tokenize("How does Autoscaling work?")).toEqual([
      "autoscaling",
      "work",
    ]);
  });

  it("drops single-character tokens", () => {
    expect(tokenize("a I go")).toEqual(["go"]);
  });
});

describe("bm25Search", () => {
  const docs = [
    { id: "compute", text: "Compute instances autoscale based on CPU utilization and request concurrency." },
    { id: "storage", text: "Storage buckets support lifecycle rules that transition objects to cheaper tiers." },
    { id: "billing", text: "Invoices are generated monthly and usage-based compute is billed per second." },
  ];

  it("ranks the most relevant document first", () => {
    const index = buildBM25Index(docs);
    const results = bm25Search(index, "how does autoscaling work for compute", 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe("compute");
  });

  it("returns results ordered by descending score", () => {
    const index = buildBM25Index(docs);
    const results = bm25Search(index, "storage lifecycle rules", 3);
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("returns an empty array for a query with no matching terms", () => {
    const index = buildBM25Index(docs);
    const results = bm25Search(index, "xyzabc123", 3);
    expect(results).toEqual([]);
  });

  it("returns an empty array for an empty index", () => {
    const index = buildBM25Index([]);
    const results = bm25Search(index, "compute", 3);
    expect(results).toEqual([]);
  });

  it("respects the topK limit", () => {
    const index = buildBM25Index(docs);
    const results = bm25Search(index, "compute storage billing", 1);
    expect(results.length).toBe(1);
  });
});
