import { Layers, X } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, type Business } from "../../data/businesses";

const PROJECT_COLOR = CATEGORIES.project.color;
const PANEL_WIDTH = 280;
const INSET = 16;

type Props = {
  projects: Business[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  isDesktop: boolean;
};

export function ProjectsPanel({
  projects,
  expandedId,
  onToggleExpand,
  isDesktop,
}: Props) {
  const [open, setOpen] = useState(true);

  const stopMapEvents = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
    onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
    onWheel: (e: React.WheelEvent) => e.stopPropagation(),
    onDoubleClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  const cardStyle: React.CSSProperties = isDesktop
    ? { right: INSET, top: INSET, width: PANEL_WIDTH }
    : {
        top: INSET,
        left: "50%",
        transform: "translateX(-50%)",
        width: `min(${PANEL_WIDTH}px, calc(100% - 32px))`,
      };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          {...stopMapEvents}
          className="pointer-events-auto absolute flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/80 backdrop-blur-xl"
          style={{
            right: INSET,
            top: INSET,
            zIndex: 2,
            backgroundColor: "rgba(20,20,22,0.85)",
          }}
        >
          <Layers size={14} style={{ color: PROJECT_COLOR }} />
          Projects
        </button>
      ) : (
        <div
          {...stopMapEvents}
          className="pointer-events-auto absolute flex max-h-[60%] flex-col overflow-hidden rounded-2xl border border-white/[0.06] backdrop-blur-xl"
          style={{
            ...cardStyle,
            zIndex: 2,
            backgroundColor: "rgba(20, 20, 22, 0.85)",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2.5">
            <span className="text-xs font-medium tracking-wide text-white/80">
              Projects
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto rounded-md p-1 text-white/45 transition-colors hover:text-white/80"
              aria-label="Close projects panel"
            >
              <X size={14} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto py-1">
            {projects.length === 0 && (
              <p className="px-3 py-3 text-xs text-white/40">No projects yet.</p>
            )}
            {projects.map((p) => {
              const isOpen = p.id === expandedId;
              return (
                <div key={p.id}>
                  <button
                    type="button"
                    onClick={() => onToggleExpand(p.id)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                    style={{
                      backgroundColor: isOpen
                        ? "rgba(216, 90, 48, 0.12)"
                        : undefined,
                    }}
                  >
                    <span
                      className="mt-[6px] block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: PROJECT_COLOR }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium text-white/90">
                        {p.name}
                      </span>
                      {p.description_short && (
                        <span className="mt-0.5 block text-[11.5px] leading-snug text-white/45 line-clamp-2">
                          {p.description_short}
                        </span>
                      )}
                    </span>
                  </button>

                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      {p.description_long && (
                        <p className="px-3 pb-3 pl-7 text-[11.5px] leading-relaxed text-white/55">
                          {p.description_long}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
