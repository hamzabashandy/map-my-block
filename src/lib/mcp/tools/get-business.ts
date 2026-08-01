import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { loadDirectory } from "../directory";

export default defineTool({
  name: "get_business",
  title: "Get a business",
  description:
    "Get full details for one directory listing by its id or exact name, including hours, contact info, coordinates, and the long description.",
  inputSchema: {
    id_or_name: z.string().min(1).describe("The listing id or its exact name."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id_or_name }) => {
    const key = id_or_name.trim().toLowerCase();
    const match = (await loadDirectory()).find(
      (b) => b.id.toLowerCase() === key || b.name.toLowerCase() === key,
    );
    if (!match) throw new ToolError(`No listing found for "${id_or_name}".`);
    return {
      content: [{ type: "text", text: JSON.stringify(match, null, 2) }],
      structuredContent: { business: match },
    };
  },
});
