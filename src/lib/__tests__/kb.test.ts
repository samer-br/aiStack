import { chunkMarkdown } from "../kb";

const SAMPLE = `# Widgets

Widgets are the core primitive.

## Creating a widget

Call \`create()\` with a name.

## Deleting a widget

Call \`delete(id)\`. This is irreversible.
`;

describe("chunkMarkdown", () => {
  it("splits a document into one chunk per H2 section plus the preamble", () => {
    const chunks = chunkMarkdown("widgets", SAMPLE);
    expect(chunks).toHaveLength(3);
    expect(chunks[0].heading).toBe("Overview");
    expect(chunks[0].text).toContain("core primitive");
    expect(chunks[1].heading).toBe("Creating a widget");
    expect(chunks[2].heading).toBe("Deleting a widget");
  });

  it("uses the H1 as the shared title for every chunk", () => {
    const chunks = chunkMarkdown("widgets", SAMPLE);
    expect(chunks.every((c) => c.title === "Widgets")).toBe(true);
  });

  it("assigns stable, source-prefixed ids", () => {
    const chunks = chunkMarkdown("widgets", SAMPLE);
    expect(chunks.map((c) => c.id)).toEqual([
      "widgets#0",
      "widgets#1",
      "widgets#2",
    ]);
  });

  it("skips empty sections", () => {
    const withEmpty = `# Doc\n\n## Empty\n\n## Filled\n\nSome content.\n`;
    const chunks = chunkMarkdown("doc", withEmpty);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].heading).toBe("Filled");
  });
});
