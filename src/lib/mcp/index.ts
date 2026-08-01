import { defineMcp } from "@lovable.dev/mcp-js";
import listBusinesses from "./tools/list-businesses";
import searchBusinesses from "./tools/search-businesses";
import getBusiness from "./tools/get-business";
import listCategories from "./tools/list-categories";

export default defineMcp({
  name: "local-connect-map",
  title: "Local Connect Map",
  version: "0.1.0",
  instructions:
    "Public tools for the iCBIG neighbourhood business directory in Ottawa. Use `search_businesses` or `list_businesses` to find shops, makers, and community spaces within walking distance, `get_business` for full details on one listing, and `list_categories` to see the available categories.",
  tools: [listBusinesses, searchBusinesses, getBusiness, listCategories],
});
