import Papa from "papaparse";
import { useCallback, useEffect, useState } from "react";
import { loadConfig } from "./runtime-config";

export type Frequency = "once" | "weekly" | "biweekly" | "monthly" | "annual";
export type WeekOfMonth = "first" | "second" | "third" | "fourth" | "last";

export type Event = {
  id: string;
  title: string;
  description: string;
  locationId?: string;
  locationName: string;
  projectId?: string;
  projectName?: string;
  frequency: Frequency;
  dayOfWeek?: string;
  weekOfMonth?: WeekOfMonth;
  /** YYYY-MM-DD */
  startDate: string;
  endDate?: string;
  /** HH:MM */
  startTime?: string;
  endTime?: string;
  /** YYYY-MM-DD list */
  exceptions: string[];
  cost?: string;
  registrationUrl?: string;
};

/** Accent used for calendar selection, event dots and pin badges. */
export const EVENT_ACCENT = "#E2725B";

type RawRow = Record<string, unknown>;

function s(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const t = String(v).trim();
  return t.length ? t : undefined;
}

const FREQUENCIES: Frequency[] = [
  "once",
  "weekly",
  "biweekly",
  "monthly",
  "annual",
];
const WEEKS: WeekOfMonth[] = ["first", "second", "third", "fourth", "last"];

const WEEKDAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** 0 (Sun) – 6 (Sat), or null when unrecognised. */
export function weekdayIndex(name?: string): number | null {
  if (!name) return null;
  const key = name.trim().toLowerCase().slice(0, 3);
  const idx = WEEKDAY_NAMES.findIndex((d) => d.startsWith(key));
  return idx === -1 ? null : idx;
}

function normDate(value?: string): string | undefined {
  if (!value) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : undefined;
}

function mapEventRow(row: RawRow): Event | null {
  if (s(row.publish)?.toLowerCase() === "no") return null;
  const status = s(row.status)?.toLowerCase();
  if (status === "cancelled" || status === "inactive") return null;

  const startDate = normDate(s(row.start_date));
  const title = s(row.title);
  if (!startDate || !title) return null;

  const rawFreq = (s(row.frequency) ?? "once").toLowerCase() as Frequency;
  const frequency = FREQUENCIES.includes(rawFreq) ? rawFreq : "once";
  const rawWeek = s(row.week_of_month)?.toLowerCase() as WeekOfMonth | undefined;

  return {
    id: s(row.event_id) ?? `${title}-${startDate}`,
    title,
    description: s(row.description) ?? "",
    locationId: s(row.location_id),
    locationName: s(row.location_name) ?? "",
    projectId: s(row.project_id),
    projectName: s(row.project_name),
    frequency,
    dayOfWeek: s(row.day_of_week),
    weekOfMonth: rawWeek && WEEKS.includes(rawWeek) ? rawWeek : undefined,
    startDate,
    endDate: normDate(s(row.end_date)),
    startTime: s(row.start_time),
    endTime: s(row.end_time),
    exceptions: (s(row.exceptions) ?? "")
      .split(/[;,]/)
      .map((x) => normDate(x.trim()))
      .filter((x): x is string => Boolean(x)),
    cost: s(row.cost),
    registrationUrl: s(row.registration_url),
  };
}

/* ------------------------------------------------------------------ dates */

const TZ = "America/Toronto";

/** Today's date in America/Toronto as YYYY-MM-DD. */
export function todayInToronto(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function ymd(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Midnight-UTC timestamp for a YYYY-MM-DD calendar date (day arithmetic only). */
function dayStamp(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole calendar days from today (America/Toronto) to `date`. */
export function calendarDayDelta(date: string, now: Date = new Date()): number {
  const diff = dayStamp(date) - dayStamp(todayInToronto(now));
  return Math.round(diff / 86_400_000);
}

/** "14 Sep" for a YYYY-MM-DD calendar date. */
export function shortDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** "1 event today", "2 events in 3 days", "1 event on 4 Aug", … */
export function relativeDayPhrase(date: string, now: Date = new Date()): string {
  const delta = calendarDayDelta(date, now);
  return delta === 0
    ? "today"
    : delta === 1
      ? "tomorrow"
      : delta === -1
        ? "yesterday"
        : delta > 1 && delta <= 6
          ? `in ${delta} days`
          : delta < -1 && delta >= -6
            ? `${Math.abs(delta)} days ago`
            : `on ${shortDate(date)}`;
}

export function eventCountLabel(
  count: number,
  date: string,
  now: Date = new Date(),
): string {
  const noun = count === 1 ? "event" : "events";
  return `${count} ${noun} ${relativeDayPhrase(date, now)}`;
}

/** Weekday (0=Sun) of a YYYY-MM-DD calendar date, timezone-independent. */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + n));
  return ymd(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate());
}

/**
 * Expands a recurrence rule into concrete YYYY-MM-DD dates inside the given
 * month (month is 0-based). Dates before startDate, after endDate, or listed
 * in exceptions are dropped.
 */
export function occurrencesInMonth(
  event: Event,
  year: number,
  month: number,
): string[] {
  const total = daysInMonth(year, month);
  const dow = weekdayIndex(event.dayOfWeek);
  let dates: string[] = [];

  switch (event.frequency) {
    case "once": {
      const [y, m] = event.startDate.split("-").map(Number);
      if (y === year && m - 1 === month) dates = [event.startDate];
      break;
    }
    case "weekly": {
      if (dow === null) break;
      for (let d = 1; d <= total; d += 1) {
        const date = ymd(year, month, d);
        if (weekdayOf(date) === dow) dates.push(date);
      }
      break;
    }
    case "biweekly": {
      if (dow === null) break;
      let anchor = event.startDate;
      while (weekdayOf(anchor) !== dow) anchor = addDays(anchor, 1);
      const first = ymd(year, month, 1);
      const last = ymd(year, month, total);
      let cursor = anchor;
      // Jump forward in 14-day strides until we reach the month.
      while (cursor < first) cursor = addDays(cursor, 14);
      while (cursor <= last) {
        dates.push(cursor);
        cursor = addDays(cursor, 14);
      }
      break;
    }
    case "monthly": {
      if (dow === null) break;
      const matching: string[] = [];
      for (let d = 1; d <= total; d += 1) {
        const date = ymd(year, month, d);
        if (weekdayOf(date) === dow) matching.push(date);
      }
      if (matching.length === 0) break;
      const week = event.weekOfMonth ?? "first";
      const pick =
        week === "last"
          ? matching[matching.length - 1]
          : matching[WEEKS.indexOf(week)];
      if (pick) dates = [pick];
      break;
    }
    case "annual": {
      const [, m, d] = event.startDate.split("-").map(Number);
      if (m - 1 === month && d <= total) dates = [ymd(year, month, d)];
      break;
    }
  }

  return dates.filter(
    (date) =>
      date >= event.startDate &&
      (!event.endDate || date <= event.endDate) &&
      !event.exceptions.includes(date),
  );
}

/** Events occurring on a specific YYYY-MM-DD, sorted all-day first then by time. */
export function eventsOnDay(events: Event[], date: string): Event[] {
  const [y, m] = date.split("-").map(Number);
  return events
    .filter((e) => occurrencesInMonth(e, y, m - 1).includes(date))
    .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
}

/** Set of YYYY-MM-DD in the month that have at least one occurrence. */
export function daysWithEvents(
  events: Event[],
  year: number,
  month: number,
): Set<string> {
  const out = new Set<string>();
  for (const e of events)
    for (const d of occurrencesInMonth(e, year, month)) out.add(d);
  return out;
}

export function formatEventTime(event: Event): string {
  if (!event.startTime) return "All day";
  return event.endTime ? `${event.startTime}–${event.endTime}` : event.startTime;
}

/* ------------------------------------------------------------------- data */

export async function fetchEvents(): Promise<Event[]> {
  const { eventsCsvUrl } = await loadConfig();
  if (!eventsCsvUrl) return [];
  const res = await fetch(eventsCsvUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Events fetch failed (${res.status})`);
  const text = await res.text();
  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return ((parsed.data ?? []) as RawRow[])
    .map(mapEventRow)
    .filter((e): e is Event => e !== null);
}

export type EventsState = {
  events: Event[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useEvents(): EventsState {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchEvents()
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Could not load events");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  return { events, loading, error, refresh };
}
