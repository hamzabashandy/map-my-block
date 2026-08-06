import { createServerFn } from "@tanstack/react-start";

export const getPublicConfig = createServerFn({ method: "GET" }).handler(
  async () => {
    return {
      mapboxToken: process.env.MAPBOX_TOKEN ?? "",
      sheetCsvUrl: process.env.SHEET_CSV_URL ?? "",
      eventsCsvUrl: process.env.EVENTS_CSV_URL ?? "",
    };
  },
);
