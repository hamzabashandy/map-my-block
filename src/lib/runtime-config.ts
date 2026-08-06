import { getPublicConfig } from "./config.functions";

type Config = {
  mapboxToken: string;
  sheetCsvUrl: string;
  eventsCsvUrl: string;
};

let cached: Promise<Config> | null = null;

export function loadConfig(): Promise<Config> {
  if (!cached) {
    cached = getPublicConfig().catch(() => ({
      mapboxToken: "",
      sheetCsvUrl: "",
      eventsCsvUrl: "",
    }));
  }
  return cached;
}
