import {
  countUpcoming,
  recurrenceLabel,
  relativeDayPhrase,
  upcomingOccurrences,
  type Event,
} from "../../lib/events";

/**
 * "Events here" — the next three upcoming occurrences for a venue or project.
 * Renders nothing at all when there are none.
 */
export function EventsHere({
  events,
  locationId,
  projectId,
  onOpenEvent,
  onSeeAll,
  className = "mt-6",
}: {
  events: Event[];
  locationId?: string;
  projectId?: string;
  onOpenEvent?: (date: string, eventId: string) => void;
  onSeeAll?: (date: string) => void;
  className?: string;
}) {
  const scope = { locationId, projectId };
  const items = upcomingOccurrences(events, { ...scope, limit: 3 });
  if (items.length === 0) return null;
  const hasMore = countUpcoming(events, { ...scope, cap: 4 }) > 3;

  return (
    <div className={className}>
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Events here
      </h3>
      <ul className="mt-2 space-y-0.5">
        {items.map(({ event, date }) => {
          const recur = recurrenceLabel(event);
          const interactive = Boolean(onOpenEvent);
          return (
            <li key={`${event.id}-${date}`}>
              <button
                type="button"
                disabled={!interactive}
                onClick={() => onOpenEvent?.(date, event.id)}
                className={`w-full rounded-lg px-2 py-2 text-left ${
                  interactive
                    ? "transition-colors hover:bg-white/[0.05]"
                    : "cursor-default"
                }`}
              >
                <span className="block text-[11px] tabular-nums text-white/45">
                  {capitalise(relativeDayPhrase(date))}
                  {event.startTime && (
                    <>
                      <span className="px-1">·</span>
                      {event.startTime}
                    </>
                  )}
                </span>
                <span className="block text-[13.5px] leading-snug text-foreground">
                  {event.title}
                </span>
                {recur && (
                  <span className="block text-[11.5px] text-white/35">
                    {recur}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {hasMore && onSeeAll && (
        <button
          type="button"
          onClick={() => onSeeAll(items[0].date)}
          className="mt-1 px-2 text-[12px] text-white/50 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white/85"
        >
          See all in calendar
        </button>
      )}
    </div>
  );
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
