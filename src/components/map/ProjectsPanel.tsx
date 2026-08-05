import type mapboxgl from "mapbox-gl";
import { Layers, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CATEGORIES, type Business } from "../../data/businesses";

const PROJECT_COLOR = CATEGORIES.project.color;
const PANEL_WIDTH = 280;
const INSET = 16;

type Props = {
  map: mapboxgl.Map | null;
  projects: Business[];
  businesses: Business[];
  adjacency: Record<string, string[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isWide: boolean;
};

type Line = { x1: number; y1: number; x2: number; y2: number };

function sameLines(a: Line[], b: Line[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (l, i) =>
      l.x1 === b[i].x1 && l.y1 === b[i].y1 && l.x2 === b[i].x2 && l.y2 === b[i].y2,
  );
}

export function ProjectsPanel({
  map,
  projects,
  businesses,
  adjacency,
  selectedId,
  onSelect,
  isWide,
}: Props) {
  const [open, setOpen] = useState(true);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [lines, setLines] = useState<Line[]>([]);

  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const selectedProject =
    projects.find((p) => p.id === selectedId && p.category === "project") ??
    null;

  const neighbourIds = selectedProject ? adjacency[selectedProject.id] ?? [] : [];
  const neighbours = neighbourIds
    .map((id) => businesses.find((b) => b.id === id))
    .filter((b): b is Business => Boolean(b));
  const mappedNeighbours = neighbours.filter(
    (b) => b.mapped && b.lat !== undefined && b.lng !== undefined,
  );
  const unmappedNeighbours = neighbours.filter((b) => !b.mapped);
  const neighbourKey = mappedNeighbours.map((b) => b.id).join(",");

  const draw = useCallback(() => {
    const host = hostRef.current;
    if (!map || !host || !open || !selectedProject) {
      setLines((prev) => (prev.length ? [] : prev));
      return;
    }
    const row = rowRefs.current.get(selectedProject.id);
    if (!row) {
      setLines((prev) => (prev.length ? [] : prev));
      return;
    }
    const hostRect = host.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const midY = rowRect.top + rowRect.height / 2 - hostRect.top;
    const leftX = rowRect.left - hostRect.left;
    const rightX = rowRect.right - hostRect.left;

    const next: Line[] = [];
    for (const b of mappedNeighbours) {
      const pt = map.project([b.lng as number, b.lat as number]);
      const useRight = pt.x >= (leftX + rightX) / 2;
      next.push({
        x1: useRight ? rightX : leftX,
        y1: midY,
        x2: pt.x,
        y2: pt.y,
      });
    }
    setLines((prev) => (sameLines(prev, next) ? prev : next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, open, selectedProject, neighbourKey]);

  const schedule = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  }, [draw]);

  useLayoutEffect(() => {
    schedule();
  });

  useEffect(() => {
    if (!map) return;
    map.on("move", schedule);
    map.on("zoom", schedule);
    map.on("resize", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      map.off("move", schedule);
      map.off("zoom", schedule);
      map.off("resize", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [map, schedule]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  // Drag (desktop only, header bar only)
  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if (!isWide) return;
    const card = cardRef.current;
    const host = hostRef.current;
    if (!card || !host) return;
    const cardRect = card.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    dragRef.current = {
      pointerId: e.pointerId,
      offsetX: e.clientX - cardRect.left,
      offsetY: e.clientY - cardRect.top,
    };
    setPos({ x: cardRect.left - hostRect.left, y: cardRect.top - hostRect.top });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.stopPropagation();
    e.preventDefault();
  };

  const onHeaderPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const card = cardRef.current;
    const host = hostRef.current;
    if (!d || d.pointerId !== e.pointerId || !card || !host) return;
    const hostRect = host.getBoundingClientRect();
    const maxX = hostRect.width - card.offsetWidth;
    const maxY = hostRect.height - card.offsetHeight;
    const x = Math.min(
      Math.max(0, e.clientX - hostRect.left - d.offsetX),
      Math.max(0, maxX),
    );
    const y = Math.min(
      Math.max(0, e.clientY - hostRect.top - d.offsetY),
      Math.max(0, maxY),
    );
    setPos({ x, y });
    schedule();
    e.stopPropagation();
  };

  const endDrag = (e: React.PointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  };

  const stopMapEvents = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onMouseDown: (e: React.MouseEvent) => e.stopPropagation(),
    onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
    onWheel: (e: React.WheelEvent) => e.stopPropagation(),
    onDoubleClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  const cardStyle: React.CSSProperties = isWide
    ? pos
      ? { left: pos.x, top: pos.y }
      : { right: INSET, top: INSET }
    : { top: INSET, left: "50%", transform: "translateX(-50%)" };

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 z-10">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ zIndex: 1 }}
      >
        {lines.map((l, i) => {
          const dx = Math.max(40, Math.abs(l.x2 - l.x1) * 0.45);
          const dir = l.x2 >= l.x1 ? 1 : -1;
          const d = `M ${l.x1} ${l.y1} C ${l.x1 + dx * dir} ${l.y1}, ${
            l.x2 - dx * dir
          } ${l.y2}, ${l.x2} ${l.y2}`;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={PROJECT_COLOR}
              strokeWidth={1.5}
              opacity={0.8}
            />
          );
        })}
      </svg>

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
          ref={cardRef}
          {...stopMapEvents}
          className="pointer-events-auto absolute flex max-h-[60%] flex-col overflow-hidden rounded-2xl border border-white/[0.06] backdrop-blur-xl"
          style={{
            ...cardStyle,
            width: PANEL_WIDTH,
            zIndex: 2,
            backgroundColor: "rgba(20, 20, 22, 0.85)",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)",
          }}
        >
          <div
            onPointerDown={onHeaderPointerDown}
            onPointerMove={onHeaderPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2.5"
            style={{ cursor: isWide ? "grab" : "default", touchAction: "none" }}
          >
            <span className="flex flex-col gap-[3px]" aria-hidden>
              <span className="block h-[2px] w-4 rounded bg-white/25" />
              <span className="block h-[2px] w-4 rounded bg-white/25" />
            </span>
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
              const isSel = p.id === selectedProject?.id;
              return (
                <div key={p.id}>
                  <div
                    ref={(el) => {
                      if (el) rowRefs.current.set(p.id, el);
                      else rowRefs.current.delete(p.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onSelect(p.id);
                    }}
                    className="flex cursor-pointer items-start gap-2 px-3 py-2 transition-colors hover:bg-white/[0.05]"
                    style={{
                      backgroundColor: isSel
                        ? "rgba(216, 90, 48, 0.12)"
                        : undefined,
                    }}
                  >
                    <span
                      className="mt-[6px] block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: PROJECT_COLOR }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-white/90">
                        {p.name}
                      </span>
                      {p.description_short && (
                        <span className="mt-0.5 block text-[11px] leading-snug text-white/45 line-clamp-2">
                          {p.description_short}
                        </span>
                      )}
                    </span>
                  </div>

                  {isSel && (
                    <div className="px-3 pb-2 pl-7">
                      {mappedNeighbours.length === 0 && (
                        <p className="text-[11px] text-white/40">
                          No mapped connections yet.
                        </p>
                      )}
                      {unmappedNeighbours.length > 0 && (
                        <div className="mt-1">
                          <p className="text-[10px] uppercase tracking-wide text-white/35">
                            Also connected
                          </p>
                          <ul className="mt-1 space-y-0.5">
                            {unmappedNeighbours.map((u) => (
                              <li key={u.id}>
                                <button
                                  type="button"
                                  onClick={() => onSelect(u.id)}
                                  className="truncate text-left text-[11px] text-white/60 hover:text-white/90"
                                >
                                  {u.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
