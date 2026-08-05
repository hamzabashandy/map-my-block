import { createFileRoute } from "@tanstack/react-router";
import type mapboxgl from "mapbox-gl";
import { useMemo, useState } from "react";
import { BottomSheet } from "../components/map/BottomSheet";
import { MapCanvas } from "../components/map/MapCanvas";
import { ProjectsPanel } from "../components/map/ProjectsPanel";
import { DIRECTORY_CATEGORIES, SidebarContent, type Tab } from "../components/map/Sidebar";
import type { CategoryId } from "../data/businesses";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { buildAdjacency, useBusinesses } from "../lib/data";

export const Route = createFileRoute("/map")({
  component: MapPage,
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
  projects: "No projects yet.",
  services: "No services listed yet.",
};

function MapPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isWide = useMediaQuery("(min-width: 1024px)");
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const { items, loading, error, refresh } = useBusinesses();
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(
    () => new Set(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("directory");
  const [snap, setSnap] = useState<0 | 1 | 2>(1);
  const adjacency = useMemo(() => buildAdjacency(items), [items]);
  const neighbourIds = selectedId ? adjacency[selectedId] ?? [] : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      if (tab === "projects") {
        if (b.category !== "project") return false;
      } else if (tab === "services") {
        if (b.category !== "services_facilitator") return false;
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
  }, [items, query, activeCategories, tab]);

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
    if (id && !isDesktop) setSnap(2);
  };

  const renderSidebar = (dragHandlers?: import("../components/map/BottomSheet").SheetDragHandlers) => (
    <SidebarContent
      businesses={items}
      filtered={filtered}
      emptyMessage={EMPTY_MESSAGES[tab]}
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
    />
  );

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <MapCanvas
        businesses={items}
        selectedId={selectedId}
        neighbourIds={neighbourIds}
        onSelect={(id) => handleSelect(id)}
        isDesktop={isDesktop}
      />

      {isDesktop ? (
        <aside
          className="pointer-events-auto absolute left-4 top-4 z-10 flex w-[380px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] backdrop-blur-xl"
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
        <BottomSheet snap={snap} onSnapChange={setSnap}>
          {(handlers) => renderSidebar(handlers)}
        </BottomSheet>
      )}
    </main>
  );
}
