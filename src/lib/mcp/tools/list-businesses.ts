import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { loadDirectory, type CategoryId } from "../directory";

export default defineTool({
  name: "list_businesses",
  title: "List neighbourhood businesses",
  description:
    "List the businesses, makers, and community spaces in the iCBIG neighbourhood directory. Optionally filter by category.",
  inputSchema: {
    category: z
      .enum([
        "business",
        "community_group",
        "institution",
        "project",
        "services_facilitator",
      ])
      .optional()
      .describe("Only return listings in this category."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category }) => {
    const all = await loadDirectory();
    const items = all.filter(
      (b) => !category || b.category === (category as CategoryId),
    );
    return {
      content: [
        {
          type: "text",
          text:
            items.length === 0
              ? "No listings match those filters."
              : items
                  .map(
                    (b) =>
                      `${b.name} (${b.category}) — ${b.address}. ${b.description_short}`,
                  )
                  .join("\n"),
        },
      ],
      structuredContent: { count: items.length, items },
    };
  },
});
