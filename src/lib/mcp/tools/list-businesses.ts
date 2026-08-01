import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { loadDirectory, type CategoryId } from "../directory";

export default defineTool({
  name: "list_businesses",
  title: "List neighbourhood businesses",
  description:
    "List the businesses, makers, and community spaces in the iCBIG neighbourhood directory. Optionally filter by category or by maximum walking time.",
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
    max_walking_minutes: z
      .number()
      .optional()
      .describe("Only return listings within this many minutes of walking."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, max_walking_minutes }) => {
    const all = await loadDirectory();
    const items = all.filter(
      (b) =>
        (!category || b.category === (category as CategoryId)) &&
        (max_walking_minutes === undefined ||
          b.walking_minutes <= max_walking_minutes),
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
                      `${b.name} (${b.category}) — ${b.address}. ${b.walking_minutes} min walk. ${b.description_short}`,
                  )
                  .join("\n"),
        },
      ],
      structuredContent: { count: items.length, items },
    };
  },
});
