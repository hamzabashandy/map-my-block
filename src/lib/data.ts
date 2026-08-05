import Papa from "papaparse";
import { useCallback, useEffect, useState } from "react";
import {
  BUSINESSES as FALLBACK,
  CATEGORIES,
  type Business,
  type CategoryId,
} from "../data/businesses";
import { loadConfig } from "./runtime-config";

type RawRow = Record<string, unknown>;

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

function ids(v: unknown): string[] {
  const raw = s(v);
  if (!raw) return [];
  return raw
    .split(/[;,]/)
    .map((x) => x.trim())
    .filter(Boolean);
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
    hours: hoursFromRow(row),
    description_short: s(row.description_short) ?? "",
    description_long: s(row.description_long) ?? "",
    photo_url: s(row.photo_url),
    connection_ids: ids(row.connection_ids),
  };
}

/**
 * Undirected adjacency map. A connection is recorded on only one of the two
 * rows, so neighbours of X = X's own connection_ids + everyone listing X.
 * Ids that don't resolve to a loaded entry are dropped.
 */
export function buildAdjacency(items: Business[]): Record<string, string[]> {
  const known = new Set(items.map((i) => i.id));
  const acc = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (a === b || !known.has(a) || !known.has(b)) return;
    if (!acc.has(a)) acc.set(a, new Set());
    if (!acc.has(b)) acc.set(b, new Set());
    acc.get(a)!.add(b);
    acc.get(b)!.add(a);
  };
  for (const item of items) {
    for (const other of item.connection_ids ?? []) link(item.id, other);
  }
  const out: Record<string, string[]> = {};
  acc.forEach((set, id) => {
    out[id] = Array.from(set);
  });
  return out;
}

export async function fetchBusinesses(): Promise<Business[]> {
  const { sheetCsvUrl } = await loadConfig();
  if (!sheetCsvUrl) {
    // No sheet configured — fall back to seeded data so the UI still works.
    return FALLBACK;
  }
  const res = await fetch(sheetCsvUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet fetch failed (${res.status})`);
  const text = await res.text();
  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  const rows = (parsed.data ?? []) as RawRow[];
  return rows
    .map(mapRow)
    .filter((b): b is Business => b !== null);
}

export type DataState = {
  items: Business[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useBusinesses(): DataState {
  const [items, setItems] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchBusinesses()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not load directory");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  return { items, loading, error, refresh };
}
