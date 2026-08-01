import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { loadDirectory } from "../directory";

export default defineTool({
  name: "search_businesses",
  title: "Search the directory",
  description:
    "Free-text search across neighbourhood directory listings by name, description, category, or address.",
  inputSchema: {
    query: z.string().min(1).describe("Search text, e.g. 'coffee' or 'yoga'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query }) => {
    const q = query.trim().toLowerCase();
    const items = (await loadDirectory()).filter((b) =>
      [
        b.name,
        b.category,
        b.address,
        b.description_short,
        b.description_long,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
    return {
      content: [
        {
          type: "text",
          text:
            items.length === 0
              ? `No listings found for "${query}".`
              : items
                  .map((b) => `${b.name} (${b.category}) — ${b.address}`)
                  .join("\n"),
        },
      ],
      structuredContent: { count: items.length, items },
    };
  },
});
