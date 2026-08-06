import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  EVENT_ACCENT,
  daysInMonth,
  daysWithEvents,
  eventsOnDay,
  formatEventTime,
  todayInToronto,
  weekdayOf,
  ymd,
  type Event,
} from "../../lib/events";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DOW = ["M", "T", "W", "T", "F", "S", "S"];

/** Monday-first column index (0-6) for a YYYY-MM-DD date. */
function mondayIndex(date: string): number {
  return (weekdayOf(date) + 6) % 7;
}

export function CalendarPanel({
  events,
  loading,
  error,
  selectedDay,
  onSelectDay,
  onSelectVenue,
  onSelectProject,
  focusEventId,
}: {
  events: Event[];
  loading: boolean;
  error: string | null;
  selectedDay: string;
  onSelectDay: (date: string) => void;
  onSelectVenue: (id: string) => void;
  onSelectProject: (id: string) => void;
  focusEventId?: string | null;
}) {
  const today = todayInToronto();
  const [year, setYear] = useState(() => Number(selectedDay.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(selectedDay.slice(5, 7)) - 1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Follow externally-driven day changes (e.g. "Events here" rows).
  useEffect(() => {
    setYear(Number(selectedDay.slice(0, 4)));
    setMonth(Number(selectedDay.slice(5, 7)) - 1);
  }, [selectedDay]);
  useEffect(() => {
    if (focusEventId) setExpandedId(focusEventId);
  }, [focusEventId]);

  const total = daysInMonth(year, month);
  const marked = useMemo(
    () => daysWithEvents(events, year, month),
    [events, year, month],
  );
  const agenda = useMemo(
    () => eventsOnDay(events, selectedDay),
    [events, selectedDay],
  );

  const lead = mondayIndex(ymd(year, month, 1));

  const shiftMonth = (delta: number) => {
    const next = new Date(Date.UTC(year, month + delta, 1));
    const y = next.getUTCFullYear();
    const m = next.getUTCMonth();
    setYear(y);
    setMonth(m);
    const day = Number(selectedDay.slice(8, 10));
    const target = day <= daysInMonth(y, m) ? day : 1;
    onSelectDay(ymd(y, m, target));
  };

  return (
    <div className="px-2.5 pb-3">
      {/* Month header */}
      <div className="flex items-center justify-between px-1 pb-1.5">
        <span className="text-[12.5px] font-medium text-foreground">
          {MONTHS[month]} {year}
        </span>
        <span className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:bg-white/[0.06] hover:text-white"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:bg-white/[0.06] hover:text-white"
          >
            <ChevronRight size={14} />
          </button>
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {DOW.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="pb-0.5 text-center text-[9.5px] uppercase tracking-wide text-white/30"
          >
            {d}
          </span>
        ))}
        {Array.from({ length: lead }).map((_, i) => (
          <span key={`lead-${i}`} />
        ))}
        {Array.from({ length: total }).map((_, i) => {
          const date = ymd(year, month, i + 1);
          const isSelected = date === selectedDay;
          const isToday = date === today;
          return (
            <button
              key={date}
              type="button"
              onClick={() => {
                setExpandedId(null);
                onSelectDay(date);
              }}
              className="relative flex h-7 flex-col items-center justify-center"
            >
              <span
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11.5px] transition-colors"
                style={{
                  backgroundColor: isSelected ? EVENT_ACCENT : "transparent",
                  color: isSelected
                    ? "#14100f"
                    : isToday
                      ? EVENT_ACCENT
                      : "rgba(255,255,255,0.72)",
                  fontWeight: isSelected || isToday ? 600 : 400,
                }}
              >
                {i + 1}
              </span>
              {marked.has(date) && (
                <span
                  className="absolute bottom-0 h-[3px] w-[3px] rounded-full"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(255,255,255,0.6)"
                      : EVENT_ACCENT,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Agenda */}
      <div className="mt-3 border-t border-white/[0.06] pt-2">
        {error ? (
          <p className="px-1 py-4 text-center text-[12px] text-white/35">
            Couldn't load events.
          </p>
        ) : loading && events.length === 0 ? (
          <p className="px-1 py-4 text-center text-[12px] text-white/35">
            Loading events…
          </p>
        ) : agenda.length === 0 ? (
          <p className="px-1 py-4 text-center text-[12px] text-white/35">
            Nothing on this day.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {agenda.map((e) => {
              const open = expandedId === e.id;
              return (
                <div key={e.id} className="rounded-xl px-1.5 py-1.5 hover:bg-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : e.id)}
                    className="w-full text-left"
                  >
                    <span className="block text-[10.5px] tabular-nums text-white/40">
                      {formatEventTime(e)}
                    </span>
                    <span className="block text-[12.5px] font-medium leading-snug text-foreground">
                      {e.title}
                    </span>
                  </button>
                  <div className="mt-0.5 text-[11px] leading-snug text-white/40">
                    {e.locationId ? (
                      <button
                        type="button"
                        onClick={() => onSelectVenue(e.locationId!)}
                        className="underline decoration-white/20 underline-offset-2 hover:text-white/80"
                      >
                        {e.locationName || "Venue"}
                      </button>
                    ) : (
                      <span>{e.locationName}</span>
                    )}
                    {e.projectName && (
                      <>
                        <span className="px-1">·</span>
                        {e.projectId ? (
                          <button
                            type="button"
                            onClick={() => onSelectProject(e.projectId!)}
                            className="underline decoration-white/20 underline-offset-2 hover:text-white/80"
                          >
                            {e.projectName}
                          </button>
                        ) : (
                          <span>{e.projectName}</span>
                        )}
                      </>
                    )}
                  </div>
                  {open && (
                    <div className="mt-1.5 space-y-1.5">
                      {e.description && (
                        <p className="text-[11.5px] leading-relaxed text-white/55">
                          {e.description}
                        </p>
                      )}
                      {e.cost && (
                        <p className="text-[11px] text-white/40">{e.cost}</p>
                      )}
                      {e.registrationUrl && (
                        <a
                          href={e.registrationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-[11.5px] underline underline-offset-2"
                          style={{ color: EVENT_ACCENT }}
                        >
                          Register →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
