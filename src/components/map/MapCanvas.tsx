import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CATEGORIES, type Business } from "../../data/businesses";
import { createMap, morphProgress } from "../../lib/map";
import { loadConfig } from "../../lib/runtime-config";

import { getStatus } from "../../lib/hours";
import { STATUS_COLORS } from "./StatusPill";

type Props = {
  businesses: Business[];
  selectedId: string | null;
  neighbourIds?: string[];
  filteredIds?: string[] | null;
  onSelect: (id: string) => void;
  isDesktop: boolean;
  /** Live pixel sizes of the floating chrome overlaying the map. */
  insets?: { top?: number; bottom?: number; left?: number; right?: number };
  onMapReady?: (map: mapboxgl.Map | null) => void;
};

type MarkerEntry = {
  marker: mapboxgl.Marker;
  el: HTMLDivElement;
  inner: HTMLDivElement;
  root: Root;
  business: Business;
};

export function MapCanvas({
  businesses,
  selectedId,
  neighbourIds,
  filteredIds,
  onSelect,
  isDesktop,
  insets,
  onMapReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const businessesRef = useRef(businesses);
  const selectedRef = useRef(selectedId);
  const neighboursRef = useRef<Set<string>>(new Set(neighbourIds ?? []));
  const onSelectRef = useRef(onSelect);
  businessesRef.current = businesses;
  selectedRef.current = selectedId;
  neighboursRef.current = new Set(neighbourIds ?? []);
  onSelectRef.current = onSelect;
  const onMapReadyRef = useRef(onMapReady);
  onMapReadyRef.current = onMapReady;
  const filteredRef = useRef<Set<string> | null>(null);
  filteredRef.current = filteredIds ? new Set(filteredIds) : null;
  const neighbourKey = (neighbourIds ?? []).join(",");
  const filteredKey = (filteredIds ?? []).join(",");
  const didInitialFitRef = useRef(false);
  const isDesktopRef = useRef(isDesktop);
  isDesktopRef.current = isDesktop;
  const insetsRef = useRef(insets);
  insetsRef.current = insets;

  /** Padding for the visible band left over once floating chrome is subtracted. */
  const cameraPadding = () => {
    const i = insetsRef.current ?? {};
    const pad = (v?: number) => (v && v > 0 ? Math.round(v) + 16 : 0);
    return {
      top: pad(i.top),
      bottom: pad(i.bottom),
      left: pad(i.left),
      right: pad(i.right),
    };
  };

  const [token, setToken] = useState<string | null>(null);
  const [visibleError, setVisibleError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig()
      .then((c) => {
        console.log(
          "[MapCanvas] mapbox token received:",
          c.mapboxToken ? `${c.mapboxToken.slice(0, 8)}…` : "(empty)",
        );

        if (!c.mapboxToken) {
          setVisibleError("Missing MAPBOX_TOKEN in Cloud secrets.");
          setToken("");
          return;
        }

        setVisibleError(null);
        setToken(c.mapboxToken);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Unknown config error";
        setVisibleError(`Failed to load runtime config: ${message}`);
        setToken("");
      });
  }, []);

  // Init map
  useEffect(() => {
    if (!containerRef.current || !token) return;
    let map: mapboxgl.Map;
    try {
      map = createMap(containerRef.current, token);
    } catch (err) {
      console.error("[MapCanvas] mapbox-gl init failed:", err);
      const message =
        err instanceof Error ? err.message : "Unknown Mapbox initialization error";
      setVisibleError(`Mapbox initialization failed: ${message}`);
      return;
    }

    const handleMapError = (event: { error?: Error }) => {
      const message = event.error?.message ?? "Unknown Mapbox error";
      console.error("[MapCanvas] mapbox runtime error:", event.error ?? event);
      setVisibleError(`Mapbox error: ${message}`);
    };

    setVisibleError(null);
    mapRef.current = map;
    onMapReadyRef.current?.(map);

    if (isDesktop) {
      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
          visualizePitch: false,
        }),
        "bottom-right",
      );
    }

    const handle = () => updateMarkers();
    map.on("zoom", handle);
    map.on("move", handle);
    map.on("load", handle);
    map.on("error", handleMapError);

    return () => {
      markersRef.current.forEach((e) => {
        e.marker.remove();
        const r = e.root;
        queueMicrotask(() => r.unmount());
      });
      markersRef.current.clear();
      map.off("error", handleMapError);
      map.remove();
      mapRef.current = null;
      onMapReadyRef.current?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, token]);

  // Sync markers with business list
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const current = markersRef.current;
    const mappedBusinesses = businesses.filter(
      (b): b is Business & { lat: number; lng: number } => b.mapped,
    );
    const nextIds = new Set(mappedBusinesses.map((b) => b.id));

    current.forEach((entry, id) => {
      if (!nextIds.has(id)) {
        entry.marker.remove();
        const r = entry.root;
        queueMicrotask(() => r.unmount());
        current.delete(id);
      }
    });

    for (const b of mappedBusinesses) {
      const existing = current.get(b.id);
      if (existing) {
        existing.business = b;
        existing.marker.setLngLat([b.lng, b.lat]);
        continue;
      }
      const el = document.createElement("div");
      el.style.width = "0";
      el.style.height = "0";
      const inner = document.createElement("div");
      inner.className = "icbig-pin";
      el.appendChild(inner);

      const root = createRoot(inner);
      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([b.lng, b.lat])
        .addTo(map);

      inner.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const m = mapRef.current;
        if (!m) return;
        const z = m.getZoom();
        m.easeTo({
          center: [b.lng, b.lat],
          zoom: Math.max(z, 17),
          duration: 600,
          padding: cameraPadding(),
        });
        onSelectRef.current(b.id);
      });

      current.set(b.id, { marker, el, inner, root, business: b });
    }

    updateMarkers();
  }, [businesses]);

  // Re-render on selection / neighbourhood change
  useEffect(() => {
    updateMarkers();
  }, [selectedId, neighbourKey, filteredKey]);

  // Frame the map on the filtered set whenever it changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !filteredIds) return;
    if (!didInitialFitRef.current) {
      didInitialFitRef.current = true;
      return;
    }
    const set = new Set(filteredIds);
    const matches = businessesRef.current.filter(
      (b) => set.has(b.id) && b.mapped && b.lng !== undefined && b.lat !== undefined,
    );
    if (matches.length === 0) return;
    const padding = cameraPadding();
    if (matches.length === 1) {
      const only = matches[0];
      map.easeTo({
        center: [only.lng!, only.lat!],
        zoom: Math.max(map.getZoom(), 17),
        duration: 600,
        padding,
      });
      return;
    }
    const bounds = new mapboxgl.LngLatBounds();
    for (const m of matches) bounds.extend([m.lng!, m.lat!]);
    map.fitBounds(bounds, { padding, maxZoom: 17, duration: 600 });
  }, [filteredKey, token]);

  // Pan to selected (or frame its mapped neighbours when it has no location)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const b = businessesRef.current.find((x) => x.id === selectedId);
    if (!b) return;

    if (b.mapped && b.lng !== undefined && b.lat !== undefined) {
      map.easeTo({
        center: [b.lng, b.lat],
        zoom: Math.max(map.getZoom(), 17),
        duration: 600,
        padding: cameraPadding(),
      });
      return;
    }

    const neighbours = businessesRef.current.filter(
      (x) =>
        neighboursRef.current.has(x.id) &&
        x.mapped &&
        x.lng !== undefined &&
        x.lat !== undefined,
    );
    if (neighbours.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    for (const nb of neighbours) bounds.extend([nb.lng!, nb.lat!]);
    map.fitBounds(bounds, {
      padding: cameraPadding(),
      maxZoom: 17,
      duration: 800,
    });
  }, [selectedId, neighbourKey]);

  function updateMarkers() {
    const map = mapRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    const t = morphProgress(zoom);
    const centerPx = map.project(map.getCenter());

    const entries = Array.from(markersRef.current.values()).map((e) => {
      const pt = map.project([e.business.lng ?? 0, e.business.lat ?? 0]);
      return {
        entry: e,
        d: Math.hypot(pt.x - centerPx.x, pt.y - centerPx.y),
        pt,
      };
    });
    entries.sort((a, b) => a.d - b.d);

    const claimed: { x: number; y: number; w: number; h: number }[] = [];
    const cardW = 210;
    const cardH = 70;
    const pad = 6;
    const morphOk = new Set<string>();
    if (t > 0) {
      for (const { entry, pt } of entries) {
        const r = {
          x: pt.x - cardW / 2,
          y: pt.y - cardH / 2,
          w: cardW,
          h: cardH,
        };
        const hit = claimed.some(
          (c) =>
            r.x < c.x + c.w + pad &&
            r.x + r.w + pad > c.x &&
            r.y < c.y + c.h + pad &&
            r.y + r.h + pad > c.y,
        );
        if (!hit) {
          claimed.push(r);
          morphOk.add(entry.business.id);
        }
      }
    }

    const selId = selectedRef.current;
    const selected = selId
      ? businessesRef.current.find((x) => x.id === selId)
      : undefined;
    const accent = selected ? CATEGORIES[selected.category].color : null;

    const filteredSet = filteredRef.current;

    for (const { entry } of entries) {
      const id = entry.business.id;
      if (filteredSet && !filteredSet.has(id) && selId !== id) {
        const localT0 = morphOk.has(id) ? t : 0;
        paintMarker(entry, localT0, "faded", null);
        continue;
      }
      const isSelected = selId === id;
      const isNeighbour = !isSelected && neighboursRef.current.has(id);
      const state: MarkerState = !selId
        ? "normal"
        : isSelected
          ? "selected"
          : isNeighbour
            ? "neighbour"
            : "dim";
      const localT = morphOk.has(id) ? t : 0;
      paintMarker(entry, localT, state, accent);
    }
  }

  if (visibleError) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center px-6 text-center"
        style={{ backgroundColor: "#1a1d22" }}
      >
        <div className="max-w-sm space-y-3">
          <p className="text-sm text-white/80">Map debug error</p>
          <p className="text-sm text-white/55">{visibleError}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ backgroundColor: "#1a1d22", width: "100%", height: "100%", minHeight: "100%" }}
    />
  );
}

type MarkerState = "normal" | "selected" | "neighbour" | "dim" | "faded";

function paintMarker(
  entry: MarkerEntry,
  t: number,
  state: MarkerState,
  accent: string | null,
) {
  const cat = CATEGORIES[entry.business.category];
  const selected = state === "selected";
  const w = 32 + (210 - 32) * t;
  const h = 32 + (60 - 32) * t;
  const radius = 16 + (12 - 16) * t;
  const textOpacity = Math.max(0, Math.min(1, (t - 0.5) * 2));
  const scale = selected ? 1.06 : 1;
  const ring = accent ?? cat.color;

  const border = selected
    ? `1.5px solid ${cat.color}`
    : state === "neighbour"
      ? `1.5px solid ${ring}`
      : `1.5px solid ${cat.color}AA`;

  const shadow = selected
    ? `0 0 0 6px ${cat.color}33, 0 8px 24px rgba(0,0,0,0.55)`
    : state === "neighbour"
      ? `0 0 0 3px ${ring}2E, 0 4px 14px rgba(0,0,0,0.45)`
      : "0 4px 14px rgba(0,0,0,0.45)";

  const el = entry.inner;
  el.style.cssText = `
    position: absolute;
    left: 0; top: 0;
    width: ${w}px;
    height: ${h}px;
    margin-left: ${-w / 2}px;
    margin-top: ${-h / 2}px;
    border-radius: ${radius}px;
    background: ${t > 0.5 ? "rgba(20,20,22,0.94)" : darken(cat.color)};
    border: ${border};
    box-shadow: ${shadow};
    transform: scale(${scale});
    opacity: ${state === "faded" ? 0.08 : state === "dim" ? 0.25 : 1};
    transition: all 200ms ease, background 300ms ease, opacity 200ms ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    overflow: hidden;
    backdrop-filter: blur(6px);
    color: white;
    z-index: ${selected ? 20 : state === "neighbour" ? 10 : 1};
  `;

  entry.root.render(
    <MarkerContent
      business={entry.business}
      t={t}
      textOpacity={textOpacity}
    />,
  );
}

function darken(hex: string): string {
  // Approximate darkening by overlaying with #0e0f12 at 65%
  return `color-mix(in oklab, ${hex} 35%, #0e0f12 65%)`;
}

function MarkerContent({
  business,
  t,
  textOpacity,
}: {
  business: Business;
  t: number;
  textOpacity: number;
}) {
  const cat = CATEGORIES[business.category];
  const Icon = cat.icon;
  const circleSize = 28 + (28 - 28) * t; // constant 28
  const smallIcon = t < 0.5;
  const iconSize = smallIcon ? 16 : 14;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: t > 0.5 ? "0 12px 0 6px" : "0",
        justifyContent: smallIcon ? "center" : "flex-start",
        gap: 10,
        position: "relative",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: smallIcon ? "100%" : circleSize,
          height: smallIcon ? "100%" : circleSize,
          borderRadius: "50%",
          background: smallIcon ? "transparent" : cat.bg,
          color: cat.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={iconSize} />
      </span>
      {t > 0 && (
        <span
          style={{
            opacity: textOpacity,
            minWidth: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.15,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "white",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {business.name}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.55)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}
          >
            {cat.label}
          </span>
        </span>
      )}
      {t > 0.5 && getStatus(business.hours) && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: STATUS_COLORS[getStatus(business.hours)?.status ?? "closed"],
            opacity: textOpacity,
            boxShadow: `0 0 0 2px rgba(20,20,22,0.92)`,
          }}
        />
      )}
    </div>
  );
}
