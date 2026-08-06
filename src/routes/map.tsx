import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BottomSheet } from "../components/map/BottomSheet";
import { MapCanvas } from "../components/map/MapCanvas";
import { ProjectsPanel } from "../components/map/ProjectsPanel";
import { DIRECTORY_CATEGORIES, SidebarContent, type Tab } from "../components/map/Sidebar";
import type { CategoryId } from "../data/businesses";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { buildAdjacency, useBusinesses } from "../lib/data";
import { eventsOnDay, todayInToronto, useEvents } from "../lib/events";

export const Route = createFileRoute("/map")({
  component: MapPage,
  validateSearch: (search: Record<string, unknown>) => ({
    select: typeof search.select === "string" ? search.select : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Map — iCBIG neighbourhood directory" },
      {
        name: "description",
        content:
          "Discover the businesses, makers, and community spaces within walking distance — an Apple Maps-style directory by iCBIG.",
      },
    ],
  }),
});

const EMPTY_MESSAGES: Record<Tab, string> = {
  directory: "No places match your search.",
  services: "No services listed yet.",
  calendar: "Nothing on this day.",
};

function MapPage() {
  const { select } = Route.useSearch();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { items, loading, error, refresh } = useBusinesses();
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useEvents();
  const [selectedDay, setSelectedDay] = useState(() => todayInToronto());
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(
    () => new Set(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("directory");
  const [snap, setSnap] = useState<0 | 1 | 2>(1);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelHeight, setPanelHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);
  const handlePanelHeight = useCallback((h: number) => setPanelHeight(h), []);
  const handleSheetHeight = useCallback((h: number) => setSheetHeight(h), []);

  // Visible map band = viewport minus the floating chrome over it.
  const mapInsets = useMemo(
    () =>
      isDesktop
        ? { top: 0, bottom: 0, left: 280, right: panelHeight > 0 ? 280 : 0 }
        : // +60 so a morphed (taller) pin clears the sheet too
          { top: panelHeight, bottom: sheetHeight > 0 ? sheetHeight + 60 : 0, left: 0, right: 0 },
    [isDesktop, panelHeight, sheetHeight],
  );
  const adjacency = useMemo(() => buildAdjacency(items), [items]);
  const neighbourIds = selectedId ? adjacency[selectedId] ?? [] : [];
  const projects = useMemo(
    () => items.filter((b) => b.category === "project"),
    [items],
  );

  const expandedProject = expandedProjectId
    ? projects.find((p) => p.id === expandedProjectId) ?? null
    : null;
  const projectConnectionIds = expandedProject
    ? adjacency[expandedProject.id] ?? []
    : [];
  const projectFilterActive = Boolean(expandedProject);

  // Deep link: /map?select=<id> preselects an entry once data is loaded
  useEffect(() => {
    if (!select) return;
    if (!items.some((b) => b.id === select)) return;
    setSelectedId(select);
  }, [select, items, isDesktop]);

  // Escape clears the project filter
  useEffect(() => {
    if (!projectFilterActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedProjectId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [projectFilterActive]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const connections = new Set(projectConnectionIds);
    return items.filter((b) => {
      if (tab === "services") {
        if (b.category !== "services_facilitator") return false;
      } else if (projectFilterActive) {
        if (!connections.has(b.id)) return false;
        if (activeCategories.size > 0 && !activeCategories.has(b.category))
          return false;
      } else {
        if (!DIRECTORY_CATEGORIES.includes(b.category)) return false;
        if (activeCategories.size > 0 && !activeCategories.has(b.category))
          return false;
      }
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.description_short.toLowerCase().includes(q) ||
        b.description_long.toLowerCase().includes(q)
      );
    });
  }, [
    items,
    query,
    activeCategories,
    tab,
    projectFilterActive,
    projectConnectionIds.join(","),
  ]);

  const toggleCategory = (id: CategoryId) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setActiveCategories(new Set());
  };

  const handleSelect = (id: string | null) => {
    setSelectedId(id);
  };

  const handleToggleProject = (id: string) => {
    setExpandedProjectId((prev) => {
      const next = prev === id ? null : id;
      if (next) {
        setActiveCategories(new Set());
        setSelectedId(null);
        setTab("directory");
      }
      return next;
    });
  };

  const handleSelectProjectFromCalendar = (id: string) => {
    setActiveCategories(new Set());
    setSelectedId(null);
    setTab("directory");
    setExpandedProjectId(id);
  };

  // locationId -> number of occurrences on the selected day
  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of eventsOnDay(events, selectedDay)) {
      if (!e.locationId) continue;
      counts[e.locationId] = (counts[e.locationId] ?? 0) + 1;
    }
    return counts;
  }, [events, selectedDay]);

  const renderSidebar = (dragHandlers?: import("../components/map/BottomSheet").SheetDragHandlers) => (

    <SidebarContent
      businesses={items}
      filtered={filtered}
      emptyMessage={
        projectFilterActive
          ? "No connections recorded yet."
          : EMPTY_MESSAGES[tab]
      }
      loading={loading}
      error={error}
      onRefresh={refresh}
      query={query}
      onQueryChange={setQuery}
      activeCategories={activeCategories}
      onToggleCategory={toggleCategory}
      selectedId={selectedId}
      onSelect={handleSelect}
      adjacency={adjacency}
      tab={tab}
      onTabChange={handleTabChange}
      dragHandlers={dragHandlers}
      projectFilterName={expandedProject?.name ?? null}
      onClearProjectFilter={() => setExpandedProjectId(null)}
      events={events}
      eventsLoading={eventsLoading}
      eventsError={eventsError}
      selectedDay={selectedDay}
      onSelectDay={setSelectedDay}
      onSelectProject={handleSelectProjectFromCalendar}
    />

  );

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <MapCanvas
        businesses={items}
        selectedId={selectedId}
        neighbourIds={neighbourIds}
        filteredIds={filtered.map((b) => b.id)}
        eventCounts={eventCounts}
        onSelect={(id) => handleSelect(id)}
        isDesktop={isDesktop}
        insets={mapInsets}
      />

      <ProjectsPanel
        projects={projects}
        expandedId={expandedProjectId}
        onToggleExpand={handleToggleProject}
        isDesktop={isDesktop}
        onHeightChange={handlePanelHeight}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />

      {isDesktop ? (
        <aside
          className="pointer-events-auto absolute left-4 top-4 z-10 flex w-[280px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] backdrop-blur-xl"
          style={{
            bottom: "1rem",
            backgroundColor: "rgba(20, 20, 22, 0.85)",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)",
          }}
        >
          {renderSidebar()}
        </aside>
      ) : (
        <BottomSheet
          snap={snap}
          onSnapChange={setSnap}
          onHeightChange={handleSheetHeight}
          reservedTop={panelHeight}
          onTallSheet={() => setPanelOpen(false)}
        >
          {(handlers) => renderSidebar(handlers)}
        </BottomSheet>
      )}
    </main>
  );
}
