import mapboxgl from "mapbox-gl";
// The inline worker mapbox-gl builds from a Blob fails to parse in the
// production bundle ("error occurred while parsing the WebWorker bundle"),
// which leaves the map blank. Hand it a worker Vite compiles itself.
import MapboxWorker from "mapbox-gl/dist/mapbox-gl-csp-worker?worker";

export const DEFAULT_CENTER: [number, number] = [-75.683846, 45.393636];
export const DEFAULT_ZOOM = 16;
export const MIN_ZOOM = 13;
export const MAX_ZOOM = 19;
export const MORPH_START = 16;
export const MORPH_END = 16.8;
export const MORPH_THRESHOLD = 16.4;

export function createMap(
  container: HTMLElement,
  token: string,
): mapboxgl.Map {
  (mapboxgl as unknown as { workerClass: unknown }).workerClass = MapboxWorker;
  mapboxgl.accessToken = token;

  return new mapboxgl.Map({
    container,
    style: "mapbox://styles/hamzabashandy/cmpggtba2008x01scgc585vii",
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    attributionControl: false,
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
  });
}

export function morphProgress(zoom: number): number {
  return Math.max(
    0,
    Math.min(1, (zoom - MORPH_START) / (MORPH_END - MORPH_START)),
  );
}
