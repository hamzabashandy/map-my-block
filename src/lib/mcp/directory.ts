import Papa from "papaparse";
import {
  BUSINESSES as FALLBACK,
  CATEGORIES,
  type Business,
  type CategoryId,
} from "../../data/businesses";

type RawRow = Record<string, unknown>;

type RuntimeGlobals = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

function runtimeEnv(name: string): string | undefined {
  return (globalThis as RuntimeGlobals).process?.env?.[name]?.trim() || undefined;
}

function s(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const t = String(v).trim();
  return t.length ? t : undefined;
}

function n(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const num = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(num) ? num : undefined;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "listing"
  );
}

function mapRow(row: RawRow): Business | null {
  const status = s(row.status)?.toLowerCase() ?? "open";
  if (status === "inactive") return null;
  if (s(row.publish)?.toLowerCase() === "no") return null;
  const lat = n(row.lat);
  const lng = n(row.lng);
  const mapped = lat !== undefined && lng !== undefined;

  const rawCat = (s(row.category) ?? "business").toLowerCase();
  const category = (Object.keys(CATEGORIES) as CategoryId[]).includes(
    rawCat as CategoryId,
  )
    ? (rawCat as CategoryId)
    : "business";

  const normalizedStatus: Business["status"] =
    status === "closing-soon" || status === "closed" ? status : "open";

  const name = s(row.name) ?? "Untitled";

  return {
    id: s(row.id) ?? slugify(name),
    name,
    category,
    lat,
    lng,
    mapped,
    address: s(row.address) ?? "",
    phone: s(row.phone),
    email: s(row.email),
    website: s(row.website),
    hours: s(row.hours) ?? "",
    status: normalizedStatus,
    walking_minutes: n(row.walking_minutes) ?? 0,
    description_short: s(row.description_short) ?? "",
    description_long: s(row.description_long) ?? "",
    photo_url: s(row.photo_url),
  };
}

/** Loads the public directory listings (published sheet, or seeded fallback). */
export async function loadDirectory(): Promise<Business[]> {
  const sheetCsvUrl =
    runtimeEnv("SHEET_CSV_URL") ?? runtimeEnv("VITE_SHEET_CSV_URL");
  if (!sheetCsvUrl) return FALLBACK;

  const res = await fetch(sheetCsvUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet fetch failed (${res.status})`);
  const text = await res.text();
  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return ((parsed.data ?? []) as RawRow[])
    .map(mapRow)
    .filter((b): b is Business => b !== null);
}

export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];
export type { Business, CategoryId };
