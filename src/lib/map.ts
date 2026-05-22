import mapboxgl from "mapbox-gl";

export const DEFAULT_CENTER: [number, number] = [-75.69, 45.4];
export const DEFAULT_ZOOM = 15;
export const MORPH_START = 16.5;
export const MORPH_END = 17.5;
export const MORPH_THRESHOLD = 17;

export function createMap(
  container: HTMLElement,
  token: string,
): mapboxgl.Map {
  mapboxgl.accessToken = token;
  return new mapboxgl.Map({
    container,
    style: "mapbox://styles/hamzabashandy/cmpggtba2008x01scgc585vii",
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
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
