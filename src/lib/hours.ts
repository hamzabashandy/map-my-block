import { useEffect, useState } from "react";

export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DAY_LABELS: Record<Day, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export type Hours = Record<Day, string | null>;

export type Status = "open" | "closing-soon" | "opens-soon" | "closed";

export const EMPTY_HOURS: Hours = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
};

/** true when every day is null (no hours concept at all) */
export function hasNoHours(hours: Hours): boolean {
  return DAYS.every((d) => hours[d] === null);
}

type Interval = { start: number; end: number };

function toMinutes(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return h * 60 + min;
}

/** Parses "07:30-23:00" or "09:00-12:30 & 13:30-16:00" into intervals. */
export function parseDay(cell: string | null): Interval[] {
  if (!cell) return [];
  const raw = cell.trim();
  if (!raw || raw.toLowerCase() === "closed") return [];
  const out: Interval[] = [];
  for (const part of raw.split("&")) {
    const [a, b] = part.split("-").map((x) => x.trim());
    const start = a ? toMinutes(a) : null;
    let end = b ? toMinutes(b) : null;
    if (start === null || end === null) continue;
    // End at or before start means it closes at midnight.
    if (end <= start) end = 24 * 60;
    out.push({ start, end });
  }
  return out.sort((x, y) => x.start - y.start);
}

export function isClosedDay(cell: string | null): boolean {
  return cell !== null && cell.trim().toLowerCase() === "closed";
}

function fmtTime(minutes: number): string {
  const total = minutes % (24 * 60);
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

function fmtCell(cell: string | null): string | null {
  if (cell === null) return null;
  if (isClosedDay(cell)) return "Closed";
  const intervals = parseDay(cell);
  if (intervals.length === 0) return null;
  return intervals
    .map((i) => `${fmtTime(i.start)}-${fmtTime(i.end)}`)
    .join(" & ");
}

/**
 * "Mon-Fri 9:00am-4:00pm · Sat 10:00am-3:00pm · Closed Sun"
 * Runs of identical days are collapsed. Days with no value are skipped.
 */
export function formatHours(hours: Hours): string {
  const parts: string[] = [];
  let i = 0;
  while (i < DAYS.length) {
    const value = fmtCell(hours[DAYS[i]]);
    if (value === null) {
      i += 1;
      continue;
    }
    let j = i;
    while (j + 1 < DAYS.length && fmtCell(hours[DAYS[j + 1]]) === value) j += 1;
    const range =
      i === j
        ? DAY_LABELS[DAYS[i]]
        : `${DAY_LABELS[DAYS[i]]}-${DAY_LABELS[DAYS[j]]}`;
    parts.push(value === "Closed" ? `Closed ${range}` : `${range} ${value}`);
    i = j + 1;
  }
  return parts.join(" · ");
}

const TZ = "America/Toronto";
const TZ_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const WEEKDAY_TO_DAY: Record<string, Day> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

/** Current day + minutes-from-midnight in America/Toronto. */
export function nowInToronto(now: Date = new Date()): {
  day: Day;
  minutes: number;
} {
  const parts = TZ_FORMATTER.formatToParts(now);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const day = WEEKDAY_TO_DAY[get("weekday")] ?? "mon";
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  return { day, minutes: hour * 60 + minute };
}

export type StatusInfo = { status: Status; opensAt?: string };

/**
 * Status for the neighbourhood's clock. null when today has no value at all —
 * render nothing rather than "Closed".
 */
export function getStatus(
  hours: Hours | undefined,
  now: Date = new Date(),
): StatusInfo | null {
  if (!hours) return null;
  const { day, minutes } = nowInToronto(now);
  const cell = hours[day];
  if (cell === null || cell.trim() === "") return null;
  if (isClosedDay(cell)) return { status: "closed" };

  const intervals = parseDay(cell);
  if (intervals.length === 0) return null;

  for (const i of intervals) {
    if (minutes >= i.start && minutes < i.end) {
      return i.end - minutes < 60
        ? { status: "closing-soon" }
        : { status: "open" };
    }
  }

  const next = intervals.find((i) => i.start > minutes);
  if (next && next.start - minutes < 60) {
    return { status: "opens-soon", opensAt: fmtTime(next.start) };
  }
  return { status: "closed" };
}

/** Recomputes once a minute so a page left open doesn't go stale. */
export function useLiveStatus(hours: Hours | undefined): StatusInfo | null {
  const [info, setInfo] = useState<StatusInfo | null>(() => getStatus(hours));
  useEffect(() => {
    setInfo(getStatus(hours));
    const id = setInterval(() => setInfo(getStatus(hours)), 60_000);
    return () => clearInterval(id);
  }, [hours]);
  return info;
}

/** Reads hours_mon..hours_sun off a sheet row. Empty cells become null. */
export function hoursFromRow(row: Record<string, unknown>): Hours {
  const out = { ...EMPTY_HOURS };
  for (const d of DAYS) {
    const raw = row[`hours_${d}`];
    if (raw === null || raw === undefined) continue;
    const text = String(raw).trim();
    out[d] = text.length ? text : null;
  }
  return out;
}
