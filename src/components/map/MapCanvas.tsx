import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CATEGORIES, type Business } from "../../data/businesses";
import { createMap, morphProgress } from "../../lib/map";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

const STATUS_DOT: Record<Business["status"], string> = {
  open: "#7BB661",
  "closing-soon": "#E0A85B",
  closed: "#E0685B",
};

type Props = {
  businesses: Business[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isDesktop: boolean;
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
  onSelect,
  isDesktop,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const businessesRef = useRef(businesses);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  businessesRef.current = businesses;
  selectedRef.current = selectedId;
  onSelectRef.current = onSelect;

  // Init map
  useEffect(() => {
    if (!containerRef.current || !TOKEN) return;
    const map = createMap(containerRef.current, TOKEN);
    mapRef.current = map;

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

    return () => {
      markersRef.current.forEach((e) => {
        e.marker.remove();
        const r = e.root;
        queueMicrotask(() => r.unmount());
      });
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  // Sync markers with business list
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const current = markersRef.current;
    const nextIds = new Set(businesses.map((b) => b.id));

    current.forEach((entry, id) => {
      if (!nextIds.has(id)) {
        entry.marker.remove();
        const r = entry.root;
        queueMicrotask(() => r.unmount());
        current.delete(id);
      }
    });

    for (const b of businesses) {
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
        if (z < 17) {
          m.easeTo({ center: [b.lng, b.lat], zoom: 17.5, duration: 1000 });
        } else {
          m.easeTo({ center: [b.lng, b.lat], duration: 600 });
        }
        onSelectRef.current(b.id);
      });

      current.set(b.id, { marker, el, inner, root, business: b });
    }

    updateMarkers();
  }, [businesses]);

  // Re-render on selection change
  useEffect(() => {
    updateMarkers();
  }, [selectedId]);

  // Pan to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const b = businessesRef.current.find((x) => x.id === selectedId);
    if (!b) return;
    map.easeTo({ center: [b.lng, b.lat], duration: 600 });
  }, [selectedId]);

  function updateMarkers() {
    const map = mapRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    const t = morphProgress(zoom);
    const centerPx = map.project(map.getCenter());

    const entries = Array.from(markersRef.current.values()).map((e) => {
      const pt = map.project([e.business.lng, e.business.lat]);
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

    for (const { entry } of entries) {
      const isSelected = selectedRef.current === entry.business.id;
      const localT = morphOk.has(entry.business.id) ? t : 0;
      paintMarker(entry, localT, isSelected);
    }
  }

  if (!TOKEN) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center px-6 text-center"
        style={{ backgroundColor: "#1a1d22" }}
      >
        <p className="max-w-sm text-sm text-white/40">
          Set <code className="text-white/70">VITE_MAPBOX_TOKEN</code> in your
          environment to load the map.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ backgroundColor: "#1a1d22" }}
    />
  );
}

function paintMarker(entry: MarkerEntry, t: number, selected: boolean) {
  const cat = CATEGORIES[entry.business.category];
  const w = 32 + (210 - 32) * t;
  const h = 32 + (60 - 32) * t;
  const radius = 16 + (12 - 16) * t;
  const textOpacity = Math.max(0, Math.min(1, (t - 0.5) * 2));
  const scale = selected ? 1.06 : 1;

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
    border: 1.5px solid ${selected ? cat.color : cat.color + "AA"};
    box-shadow: ${
      selected
        ? `0 0 0 6px ${cat.color}33, 0 8px 24px rgba(0,0,0,0.55)`
        : "0 4px 14px rgba(0,0,0,0.45)"
    };
    transform: scale(${scale});
    transition: all 200ms ease, background 300ms ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    overflow: hidden;
    backdrop-filter: blur(6px);
    color: white;
    z-index: ${selected ? 20 : 1};
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
            {cat.label} · {business.walking_minutes} min walk
          </span>
        </span>
      )}
      {t > 0.5 && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: STATUS_DOT[business.status],
            opacity: textOpacity,
            boxShadow: `0 0 0 2px rgba(20,20,22,0.92)`,
          }}
        />
      )}
    </div>
  );
}
