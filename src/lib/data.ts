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

function mapRow(row: RawRow): Business | null {
  const status = s(row.status)?.toLowerCase() ?? "open";
  if (status === "inactive") return null;
  const lat = n(row.lat);
  const lng = n(row.lng);
  if (lat === undefined || lng === undefined) return null;

  const rawCat = (s(row.category) ?? "community").toLowerCase();
  const category = (Object.keys(CATEGORIES) as CategoryId[]).includes(
    rawCat as CategoryId,
  )
    ? (rawCat as CategoryId)
    : "community";

  const normalizedStatus: Business["status"] =
    status === "closing-soon" || status === "closed" ? status : "open";

  return {
    id: s(row.id) ?? `${lat},${lng}`,
    name: s(row.name) ?? "Untitled",
    category,
    lat,
    lng,
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
