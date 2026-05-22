import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BottomSheet } from "../components/map/BottomSheet";
import { MapCanvas } from "../components/map/MapCanvas";
import { SidebarContent, type Tab } from "../components/map/Sidebar";
import type { CategoryId } from "../data/businesses";
import { useMediaQuery } from "../hooks/useMediaQuery";

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

function MapPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(
    () => new Set(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("places");
  const [snap, setSnap] = useState<0 | 1 | 2>(1);

  const toggleCategory = (id: CategoryId) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelect = (id: string | null) => {
    setSelectedId(id);
    if (id && !isDesktop) setSnap(2);
  };

  const sidebar = (
    <SidebarContent
      query={query}
      onQueryChange={setQuery}
      activeCategories={activeCategories}
      onToggleCategory={toggleCategory}
      selectedId={selectedId}
      onSelect={handleSelect}
      tab={tab}
      onTabChange={setTab}
    />
  );

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <MapCanvas />

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
          {sidebar}
        </aside>
      ) : (
        <BottomSheet snap={snap} onSnapChange={setSnap}>
          {sidebar}
        </BottomSheet>
      )}
    </main>
  );
}
