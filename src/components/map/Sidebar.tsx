import { Map as MapIcon, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { type Business, type CategoryId } from "../../data/businesses";
import type { Event } from "../../lib/events";
import type { SheetDragHandlers } from "./BottomSheet";
import { BusinessList } from "./BusinessList";
import { CalendarPanel } from "./CalendarPanel";
import { CategoryPills } from "./CategoryPills";
import { DetailPanel } from "./DetailPanel";
import { EventProposalForm } from "./EventProposalForm";
import { SearchBar } from "./SearchBar";
import { ServiceSignupForm } from "./ServiceSignupForm";

export type Tab = "directory" | "services" | "calendar";

export const DIRECTORY_CATEGORIES: CategoryId[] = [
  "business",
  "community_group",
  "institution",
];

type Props = {
  businesses: Business[];
  filtered: Business[];
  emptyMessage: string;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  query: string;
  onQueryChange: (v: string) => void;
  activeCategories: Set<CategoryId>;
  onToggleCategory: (id: CategoryId) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  adjacency?: Record<string, string[]>;
  tab: Tab;
  onTabChange: (t: Tab) => void;
  dragHandlers?: SheetDragHandlers;
  projectFilterName?: string | null;
  onClearProjectFilter?: () => void;
  events: Event[];
  eventsLoading: boolean;
  eventsError: string | null;
  selectedDay: string;
  onSelectDay: (date: string) => void;
  onSelectProject: (id: string) => void;
  focusEventId?: string | null;
  onOpenEvent?: (date: string, eventId: string) => void;
  onSeeAllEvents?: (date: string) => void;
};


export function SidebarContent({
  businesses,
  filtered,
  emptyMessage,
  loading,
  error,
  onRefresh,
  query,
  onQueryChange,
  activeCategories,
  onToggleCategory,
  selectedId,
  onSelect,
  adjacency,
  tab,
  onTabChange,
  dragHandlers,
  projectFilterName,
  onClearProjectFilter,
  events,
  eventsLoading,
  eventsError,
  selectedDay,
  onSelectDay,
  onSelectProject,
  focusEventId,
  onOpenEvent,
  onSeeAllEvents,
}: Props) {
  const selected = selectedId
    ? businesses.find((b) => b.id === selectedId) ?? null
    : null;
  const neighbours = (() => {
    if (!selected) return [] as Business[];
    const ids = adjacency?.[selected.id] ?? [];
    return ids
      .map((id) => businesses.find((b) => b.id === id))
      .filter((b): b is Business => Boolean(b));
  })();

  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  useEffect(() => {
    if (tab !== "services") setServiceFormOpen(false);
    if (tab !== "calendar") setEventFormOpen(false);
  }, [tab]);
  const showServiceForm = tab === "services" && serviceFormOpen && !selected;
  const showEventForm = tab === "calendar" && eventFormOpen && !selected;
  const isCalendar = tab === "calendar" && !selected;

  const stopDrag = (e: React.SyntheticEvent) => e.stopPropagation();


  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header (draggable on mobile) */}
      <div
        {...(dragHandlers ?? {})}
        className={`flex items-center gap-3 px-4 pb-3 pt-4 ${dragHandlers ? "touch-none select-none" : ""}`}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <MapIcon className="h-4 w-4 text-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-serif text-[15px] leading-tight">iCBIG</div>
          <div className="text-[11.5px] text-muted-foreground">
            Neighbourhood directory
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          onPointerDown={stopDrag}
          onTouchStart={stopDrag}
          onMouseDown={stopDrag}
          aria-label="Refresh directory"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search + pills (hidden on detail) */}
      {!selected && !showServiceForm && !isCalendar && (
        <div className="space-y-3 px-3 pb-3">
          <div
            {...(dragHandlers ?? {})}
            className={dragHandlers ? "touch-none" : ""}
          >
            <SearchBar value={query} onChange={onQueryChange} />
          </div>
          {tab === "directory" && (
            <CategoryPills
              active={activeCategories}
              onToggle={onToggleCategory}
              categories={DIRECTORY_CATEGORIES}
              projectPill={
                projectFilterName
                  ? {
                      name: projectFilterName,
                      onDeactivate: () => onClearProjectFilter?.(),
                    }
                  : null
              }
            />
          )}
        </div>
      )}

      {/* Body */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <PanelSwap show={selected ? "detail" : "list"}>
          {{
            list: showServiceForm ? (
              <ServiceSignupForm onBack={() => setServiceFormOpen(false)} />
            ) : showEventForm ? (
              <EventProposalForm
                onBack={() => setEventFormOpen(false)}
                venues={businesses.filter((b) => b.category !== "project")}
                projects={businesses.filter((b) => b.category === "project")}
              />
            ) : isCalendar ? (
              <div className="thin-scroll h-full overflow-y-auto">
                <div className="mx-2.5 mb-2 flex items-center gap-2 rounded-xl bg-white/[0.04] px-2.5 py-2.5">
                  <span className="min-w-0 flex-1 text-[11.5px] leading-snug text-white/55">
                    Something happening in the neighbourhood?
                  </span>
                  <button
                    type="button"
                    onClick={() => setEventFormOpen(true)}
                    className="shrink-0 rounded-full bg-white/[0.1] px-2.5 py-1 text-[11.5px] font-medium text-foreground transition-colors hover:bg-white/[0.18]"
                  >
                    Propose an event
                  </button>
                </div>
                <CalendarPanel
                  events={events}
                  loading={eventsLoading}
                  error={eventsError}
                  selectedDay={selectedDay}
                  onSelectDay={onSelectDay}
                  onSelectVenue={onSelect}
                  onSelectProject={onSelectProject}
                  focusEventId={focusEventId}
                />
              </div>
            ) : (

              <div className="thin-scroll h-full overflow-y-auto pb-2">
                {error ? (
                  <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                    <p>Couldn't load the directory.</p>
                    <p className="mt-1 text-[12px] text-white/30">{error}</p>
                    <button
                      type="button"
                      onClick={onRefresh}
                      className="mt-3 rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] text-foreground hover:bg-white/[0.1]"
                    >
                      Try again
                    </button>
                  </div>
                ) : loading && businesses.length === 0 ? (
                  <div className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                    Loading neighbourhood…
                  </div>
                ) : (
                  <>
                    {tab === "services" && (
                      <div className="mx-2.5 mb-2 flex items-center gap-2 rounded-xl bg-white/[0.04] px-2.5 py-2.5">
                        <span className="min-w-0 flex-1 text-[11.5px] leading-snug text-white/55">
                          Offer a service in the neighbourhood?
                        </span>
                        <button
                          type="button"
                          onClick={() => setServiceFormOpen(true)}
                          className="shrink-0 rounded-full bg-white/[0.1] px-2.5 py-1 text-[11.5px] font-medium text-foreground transition-colors hover:bg-white/[0.18]"
                        >
                          Add your service
                        </button>
                      </div>
                    )}
                    <BusinessList
                      items={filtered}
                      onSelect={onSelect}
                      emptyMessage={emptyMessage}
                    />
                  </>
                )}
              </div>
            ),
            detail: selected ? (
              <DetailPanel
                business={selected}
                neighbours={neighbours}
                onSelect={(id) => onSelect(id)}
                onBack={() => onSelect(null)}
                events={events}
                onOpenEvent={onOpenEvent}
                onSeeAllEvents={onSeeAllEvents}
              />
            ) : null,
          }}
        </PanelSwap>
      </div>

      {/* Tabs */}
      {!selected && (
        <div className="border-t border-white/[0.06] px-2 py-1.5">
          <div className="flex items-center gap-1">
            {(
              [
                { id: "directory", label: "Directory" },
                { id: "services", label: "Services" },
                { id: "calendar", label: "Calendar" },
              ] as { id: Tab; label: string }[]


            ).map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTabChange(t.id)}
                  className="flex-1 rounded-lg py-1.5 text-[12.5px] font-medium transition-colors"
                  style={{
                    color: active
                      ? "var(--foreground)"
                      : "rgba(255,255,255,0.5)",
                    backgroundColor: active
                      ? "rgba(255,255,255,0.06)"
                      : "transparent",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PanelSwap({
  show,
  children,
}: {
  show: "list" | "detail";
  children: { list: React.ReactNode; detail: React.ReactNode };
}) {
  return (
    <div className="relative h-full">
      <div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          transform: show === "list" ? "translateX(0)" : "translateX(-8%)",
          opacity: show === "list" ? 1 : 0,
          pointerEvents: show === "list" ? "auto" : "none",
        }}
      >
        {children.list}
      </div>
      <div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          transform: show === "detail" ? "translateX(0)" : "translateX(8%)",
          opacity: show === "detail" ? 1 : 0,
          pointerEvents: show === "detail" ? "auto" : "none",
        }}
      >
        {children.detail}
      </div>
    </div>
  );
}
