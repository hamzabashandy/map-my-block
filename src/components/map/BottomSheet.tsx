import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Snap points expressed as fractions of viewport height (the visible height
 * of the sheet). Larger = more open.
 */
const SNAPS = [0.22, 0.55, 0.92] as const;
type SnapIndex = 0 | 1 | 2;

const DRAG_THRESHOLD = 8;

export type SheetDragHandlers = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
};

export function BottomSheet({
  children,
  snap,
  onSnapChange,
  onUserDrag,
  onHeightChange,
  reservedTop = 0,
  onTallSheet,
}: {
  children: (handlers: SheetDragHandlers) => React.ReactNode;
  snap: SnapIndex;
  onSnapChange: (s: SnapIndex) => void;
  onUserDrag?: () => void;
  /** Reports the sheet's current pixel height so camera moves can pad for it. */
  onHeightChange?: (height: number) => void;
  /** Space at the top of the viewport the sheet must never grow into. */
  reservedTop?: number;
  /** Fired when the sheet grows tall enough to compete with the projects panel. */
  onTallSheet?: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startY: number;
    startHeight: number;
    pointerId: number;
    moved: boolean;
  } | null>(null);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const rawViewportHeight = () =>
    typeof window === "undefined" ? 800 : window.innerHeight;
  const available = Math.max(
    160,
    rawViewportHeight() - (reservedTop > 0 ? reservedTop + 16 : 0),
  );
  const viewportHeight = () => available;

  const heightForSnap = useCallback(
    (s: SnapIndex) => Math.round(viewportHeight() * SNAPS[s]),
    [available],
  );


  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = {
      startY: e.clientY,
      startHeight: heightForSnap(snap),
      pointerId: e.pointerId,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dy = e.clientY - dragState.current.startY;
    if (!dragState.current.moved) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return;
      dragState.current.moved = true;
      setDragHeight(dragState.current.startHeight);
    }
    const next = Math.min(
      viewportHeight() * 0.96,
      Math.max(60, dragState.current.startHeight - dy),
    );
    if (next > rawViewportHeight() * 0.6) onTallSheet?.();
    setDragHeight(next);
  };

  const onPointerUp = () => {
    const state = dragState.current;
    if (!state) return;
    dragState.current = null;

    if (!state.moved) {
      // Tap — toggle between expanded/half
      const next: SnapIndex = snap === 2 ? 1 : 2;
      setDragHeight(null);
      onUserDrag?.();
      if (next === 2) onTallSheet?.();
      onSnapChange(next);
      return;
    }

    const current = dragHeight ?? heightForSnap(snap);
    const nearest = ((): SnapIndex => {
      let idx: SnapIndex = 0;
      let best = Infinity;
      SNAPS.forEach((frac, i) => {
        const d = Math.abs(viewportHeight() * frac - current);
        if (d < best) {
          best = d;
          idx = i as SnapIndex;
        }
      });
      return idx;
    })();
    setDragHeight(null);
    onUserDrag?.();
    if (nearest === 2) onTallSheet?.();
    onSnapChange(nearest);
  };

  const handlers: SheetDragHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };

  // Re-evaluate height when viewport resizes
  useEffect(() => {
    const onResize = () => setDragHeight(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const height = dragHeight ?? heightForSnap(snap);

  useEffect(() => {
    onHeightChange?.(height);
  }, [height, onHeightChange]);
  useEffect(() => () => onHeightChange?.(0), [onHeightChange]);
  const isFullyExpanded = snap === 2 && dragHeight == null;

  return (
    <div
      ref={sheetRef}
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-white/[0.06] backdrop-blur-xl"
      style={{
        height,
        backgroundColor: "rgba(20, 20, 22, 0.92)",
        transition: dragHeight == null ? "height 280ms cubic-bezier(0.32, 0.72, 0, 1)" : "none",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.4)",
      }}
    >
      {/* Drag handle */}
      <div
        {...handlers}
        className="flex h-7 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      >
        <span className="h-1 w-9 rounded-full bg-white/20" />
      </div>
      <div
        className="h-[calc(100%-1.75rem)]"
        style={{
          overflow: isFullyExpanded ? "auto" : "hidden",
        }}
      >
        {children(handlers)}
      </div>
    </div>
  );
}
