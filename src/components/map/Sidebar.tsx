import { Map as MapIcon } from "lucide-react";
import { useMemo } from "react";
import {
  BUSINESSES,
  type Business,
  type CategoryId,
} from "../../data/businesses";
import { AboutTab } from "./AboutTab";
import { BusinessList } from "./BusinessList";
import { CategoryPills } from "./CategoryPills";
import { ContactTab } from "./ContactTab";
import { DetailPanel } from "./DetailPanel";
import { SearchBar } from "./SearchBar";

export type Tab = "places" | "about" | "contact";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  activeCategories: Set<CategoryId>;
  onToggleCategory: (id: CategoryId) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  tab: Tab;
  onTabChange: (t: Tab) => void;
  /** Hide header/search/pills/tabs when collapsed on mobile */
  compact?: boolean;
};

export function SidebarContent({
  query,
  onQueryChange,
  activeCategories,
  onToggleCategory,
  selectedId,
  onSelect,
  tab,
  onTabChange,
}: Props) {
  const filtered = useMemo(() => filterBusinesses(query, activeCategories), [
    query,
    activeCategories,
  ]);
  const selected = selectedId
    ? BUSINESSES.find((b) => b.id === selectedId) ?? null
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <MapIcon className="h-4 w-4 text-foreground" />
        </span>
        <div className="min-w-0">
          <div className="font-serif text-[15px] leading-tight">iCBIG</div>
          <div className="text-[11.5px] text-muted-foreground">
            Neighbourhood directory
          </div>
        </div>
      </div>

      {/* Search + pills (hidden on detail) */}
      {!selected && (
        <div className="space-y-3 px-3 pb-3">
          <SearchBar value={query} onChange={onQueryChange} />
          <CategoryPills active={activeCategories} onToggle={onToggleCategory} />
        </div>
      )}

      {/* Body */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <PanelSwap show={selected ? "detail" : "list"}>
          {{
            list: (
              <div className="h-full overflow-y-auto pb-2">
                {tab === "places" && (
                  <BusinessList items={filtered} onSelect={onSelect} />
                )}
                {tab === "about" && <AboutTab />}
                {tab === "contact" && <ContactTab />}
              </div>
            ),
            detail: selected ? (
              <DetailPanel
                business={selected}
                onBack={() => onSelect(null)}
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
                { id: "places", label: "Places" },
                { id: "about", label: "About" },
                { id: "contact", label: "Contact" },
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

function filterBusinesses(
  query: string,
  active: Set<CategoryId>,
): Business[] {
  const q = query.trim().toLowerCase();
  return BUSINESSES.filter((b) => {
    if (active.size > 0 && !active.has(b.category)) return false;
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.description_short.toLowerCase().includes(q) ||
      b.description_long.toLowerCase().includes(q)
    );
  });
}
