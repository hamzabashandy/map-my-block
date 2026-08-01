import { defineTool } from "@lovable.dev/mcp-js";
import { loadDirectory, CATEGORY_IDS } from "../directory";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description:
    "List the directory categories and how many listings each currently contains.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const items = await loadDirectory();
    const counts = CATEGORY_IDS.map((id) => ({
      id,
      count: items.filter((b) => b.category === id).length,
    }));
    return {
      content: [
        {
          type: "text",
          text: counts.map((c) => `${c.id}: ${c.count}`).join("\n"),
        },
      ],
      structuredContent: { categories: counts },
    };
  },
});
