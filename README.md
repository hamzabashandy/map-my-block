# Local Connect Map

Build a neighborhood business directory website for iCBIG, a nonprofit (NGO) in Ottawa. It's the kind of site where someone visits to discover the businesses, makers, and community spaces within walking distance of where they live.
The aesthetic reference is Apple Maps — dark, immersive, full-bleed map with a clean sidebar on desktop and a bottom sheet on mobile. Avoid anything that feels like a generic WordPress directory or like Google Maps. Use a dark theme by default with warm accent colors (coral, amber, soft green, soft blue, muted purple) for category pins. Typography should be clean and modern — use Inter for UI and a serif like Fraunces or Source Serif for editorial/headline moments.
Pages and structure
The site has two routes:
Route 1: / — the intro splash page

Full-viewport, centered layout. No nav bar, no clutter.
A small wordmark at the top: "iCBIG"
One paragraph in the center. Use this exact copy:

"iCBIG is an NGO working to strengthen local neighbourhoods and local economies by fostering collaboration between businesses, community organizations, residents, and students — through networking, knowledge exchange, community initiatives, neighbourhood-based action projects, and the development of shared local resource and skills databases. iCBIG serves as a connector and collaborative platform that supports more resilient, engaged, and sustainable local communities."


One large primary button below the paragraph: "Open the map →" that routes to /map.
A discrete footer with: a phone number placeholder (e.g. (613) 555-0100), an email placeholder (e.g. hello@betweenthebridges.ca), and a small "Get in touch" link that opens the email in mailto:.
The background should be the same dark color as the map page so the transition feels seamless.

Route 2: /map — the directory itself
This is the main experience. Layout follows Apple Maps:

Desktop (≥768px): a left sidebar, roughly 380px wide, floating over a full-screen map. The sidebar has rounded corners, a subtle dark translucent background (something like rgba(20, 20, 22, 0.85) with backdrop blur), and sits with a 16px margin from the screen edges. The map fills everything behind it.
Mobile (<768px): the map is full-screen. The sidebar becomes a bottom sheet that can be dragged up to expand or down to collapse. It should have three snap points: collapsed (showing just the search bar and category pills), half-open (showing the search + pills + 4-5 list items), and fully expanded (full list, scrollable).

Sidebar contents (both desktop and mobile)
The sidebar has these sections, top to bottom:

Header: A small circular icon (use a Tabler map-2 icon or similar) next to the text "iCBIG" with a subtitle "Neighborhood directory."
Search bar: A search input with a magnifying-glass icon, placeholder text "Search businesses, makers, places…"
Category filter pills: A horizontal scrollable row of pill-shaped filter buttons. Each pill has an icon + label. Use these five categories with these colors:

Food & drink — coral (#D85A30 text on a soft coral background)
Wellness — green (#3B6D11 on soft green)
Arts & makers — blue (#185FA5 on soft blue)
Shops & services — amber (#854F0B on soft amber)
Community — purple (#534AB7 on soft purple)
Pills toggle on/off when clicked. Multiple can be active at once. When none are active, show all.


Results list: A scrollable list of business cards. Each card shows:

A 32px circular avatar on the left, colored by category, containing the category icon
Business name (15px, medium weight)
One-line descriptor: category · walking time (e.g. "Pottery & ceramics · 3 min walk")
A status pill on the right: green "Open" / amber "Closes 5pm" / red "Closed"
On hover, the card highlights subtly. On click, see "Detail panel" below.


Tabs at the bottom of the sidebar: a small row of three tabs — Places (the default, what's described above), About, Contact.

About tab: shows a longer version of the intro paragraph plus a small "How this works" section explaining that the directory is community-maintained.
Contact tab: phone, email, and a placeholder for "Suggest a business" (just a mailto: link for now).



Detail panel (when a business is clicked)
When a user clicks a business in the list OR clicks a pin on the map:

The sidebar's results list slides out and a detail panel slides in (same width, animated transition).
The detail panel has a back arrow at the top to return to the list.
Below the back arrow, in order: business name (22px), category badge, status pill, address, phone (if any), website (if any), hours, and a "About" paragraph (the description_long field — this is the warm, neighborly sentence like "Run by Elena, here since 2018").
A "Get directions" button at the bottom opens Apple Maps / Google Maps with the coordinates.
On the map, the corresponding pin gets a halo/highlight to indicate selection. The map gently pans to center on it (don't zoom in aggressively — just a soft pan).

The map (placeholder for now in Prompt 1)
For this first prompt, do not integrate Mapbox yet. Just put a dark placeholder div where the map will go (a solid color like #1a1d22 with the text "Map will load here" centered in a muted color). The next prompt will wire up the real map.
Data (placeholder for now)
For this first prompt, hardcode an array of about 8-10 mock businesses directly in the code so the UI has something to render. Use this shape:
tstype Business = {
  id: string;
  name: string;
  category: 'food' | 'wellness' | 'arts' | 'shops' | 'community';
  lat: number;
  lng: number;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  hours: string;
  status: 'open' | 'closing-soon' | 'closed';
  walking_minutes: number;
  description_short: string;
  description_long: string;
  photo_url?: string;
};
Make up 8-10 mock entries with realistic Ottawa coordinates near the Rideau Canal in Old Ottawa South (lat around 45.39-45.41, lng around -75.68 to -75.70). Mix of all five categories.
Tech stack

React + Vite
TypeScript
Tailwind CSS
React Router for the two routes
Use lucide-react for icons
No backend in this prompt

What I do not want

No Material UI, no Chakra, no Bootstrap. Pure Tailwind.
No hero images, no marketing imagery, no stock photos
No light mode in this version — dark only
No "powered by" badges or visible attributions in the UI chrome
No login, no auth, no user accounts

Build this first. I'll review and then we'll wire in the real map and data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d473448b-4ea7-4e90-95b2-db3c4b6c6e85).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
