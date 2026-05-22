# iCBIG Neighborhood Directory — Build Plan

A dark, Apple Maps-inspired directory for an Ottawa NGO. Two routes, mock data, placeholder map (Mapbox wires in next prompt).

## Scope

- Scaffold a fresh React + Vite + TS + Tailwind web app
- Route `/` — splash with wordmark, intro paragraph, "Open the map →" CTA, discrete footer
- Route `/map` — full-bleed dark map placeholder with floating sidebar (desktop) / draggable bottom sheet (mobile)
- Mock data array (~9 businesses, Old Ottawa South coords)
- No Mapbox, no backend, no auth, dark only

## Visual system

- Background `#0E0F12`; sidebar `rgba(20,20,22,0.85)` + backdrop blur; 16px margin; rounded-2xl
- Map placeholder: `#1a1d22` with muted centered "Map will load here"
- Inter for UI, Fraunces for editorial headline moments (Google Fonts)
- Category tokens (text on soft tinted background):
  - food coral `#D85A30`, wellness green `#3B6D11`, arts blue `#185FA5`, shops amber `#854F0B`, community purple `#534AB7`
- Status pills: green Open / amber Closes / red Closed
- Icons: lucide-react (`Map`, `Search`, `UtensilsCrossed`, `Leaf`, `Palette`, `ShoppingBag`, `Users`, `ArrowLeft`, `Navigation`)

## Routes & components

```text
src/
  main.tsx            BrowserRouter
  App.tsx             routes: / and /map
  index.css           tailwind + tokens + fonts
  pages/
    Splash.tsx
    MapPage.tsx
  components/map/
    Sidebar.tsx           shared shell (header + tabs)
    SearchBar.tsx
    CategoryPills.tsx
    BusinessList.tsx
    BusinessCard.tsx
    DetailPanel.tsx
    BottomSheet.tsx       mobile wrapper, 3 snap points via drag
    MapCanvas.tsx         placeholder div for now
    AboutTab.tsx
    ContactTab.tsx
  data/
    businesses.ts         mock array + Business type + category meta
  hooks/
    useMediaQuery.ts
    useBottomSheet.ts     snap-point drag logic (pointer events)
```

## Sidebar behavior

- State held in `MapPage`: `query`, `activeCategories: Set`, `selectedId`, `tab: 'places'|'about'|'contact'`
- Filtering: name/description match + (no pills active → all, else category ∈ active)
- Selection: clicking a card swaps list→detail with a slide transition (CSS translate + opacity, 250ms)
- Detail "Get directions" → `https://www.google.com/maps/dir/?api=1&destination=lat,lng`

## Mobile bottom sheet

- Snap points as viewport-height fractions: collapsed 22%, half 55%, full 92%
- Drag handle at top; pointer events update translateY; on release snap to nearest
- Content scroll only enabled when fully expanded to prevent gesture conflict

## Mock data (9 entries)

Mix across all 5 categories near Bank St / Rideau Canal (lat 45.39–45.41, lng -75.68 to -75.70). Examples: "Elena Ceramics" (arts), "Canal Coffee" (food), "Sunnyside Yoga" (wellness), "Old Ottawa South Hardware" (shops), "Riverside Community Hub" (community), etc. Each with realistic address, hours string, walking_minutes 2–14, status mix, warm `description_long`.

## Out of scope this prompt

- Real Mapbox map, pin rendering on map, pan-to-selected, halo
- Real data / CMS / backend
- Light mode, auth, marketing imagery

## Tech notes

- Scaffold via web_app artifact (TanStack Start template ships by default — will adapt routing to the two routes specified, using the template's router)
- Tailwind config extended with category color tokens and `font-serif: Fraunces`
- No external UI libs beyond lucide-react