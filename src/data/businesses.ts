import {
  UtensilsCrossed,
  Leaf,
  Palette,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";

export type CategoryId = "food" | "wellness" | "arts" | "shops" | "community";

export type Business = {
  id: string;
  name: string;
  category: CategoryId;
  lat: number;
  lng: number;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  hours: string;
  status: "open" | "closing-soon" | "closed";
  walking_minutes: number;
  description_short: string;
  description_long: string;
  photo_url?: string;
};

export type CategoryMeta = {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  /** accent color (text + pin) */
  color: string;
  /** soft background tint */
  bg: string;
};

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  food: {
    id: "food",
    label: "Food & drink",
    icon: UtensilsCrossed,
    color: "#D85A30",
    bg: "rgba(216, 90, 48, 0.16)",
  },
  wellness: {
    id: "wellness",
    label: "Wellness",
    icon: Leaf,
    color: "#7BB661",
    bg: "rgba(123, 182, 97, 0.16)",
  },
  arts: {
    id: "arts",
    label: "Arts & makers",
    icon: Palette,
    color: "#5B9BE0",
    bg: "rgba(91, 155, 224, 0.16)",
  },
  shops: {
    id: "shops",
    label: "Shops & services",
    icon: ShoppingBag,
    color: "#E0A85B",
    bg: "rgba(224, 168, 91, 0.16)",
  },
  community: {
    id: "community",
    label: "Community",
    icon: Users,
    color: "#9B8BE0",
    bg: "rgba(155, 139, 224, 0.16)",
  },
};

export const CATEGORY_LIST: CategoryMeta[] = [
  CATEGORIES.food,
  CATEGORIES.wellness,
  CATEGORIES.arts,
  CATEGORIES.shops,
  CATEGORIES.community,
];

export const BUSINESSES: Business[] = [
  {
    id: "elena-ceramics",
    name: "Elena Ceramics",
    category: "arts",
    lat: 45.3962,
    lng: -75.6841,
    address: "1123 Bank St, Ottawa, ON",
    phone: "(613) 555-0142",
    website: "https://elenaceramics.example",
    hours: "Tue–Sat · 10am–6pm",
    status: "open",
    walking_minutes: 3,
    description_short: "Pottery & ceramics",
    description_long:
      "Run by Elena, here since 2018. A small studio turning out hand-thrown mugs, planters, and the occasional wedding commission.",
  },
  {
    id: "canal-coffee",
    name: "Canal Coffee",
    category: "food",
    lat: 45.3994,
    lng: -75.6862,
    address: "1089 Bank St, Ottawa, ON",
    phone: "(613) 555-0187",
    hours: "Daily · 7am–5pm",
    status: "open",
    walking_minutes: 2,
    description_short: "Espresso & pastries",
    description_long:
      "A two-table espresso bar across from the canal. Beans roasted in Hintonburg, sourdough from the bakery next door.",
  },
  {
    id: "oos-hardware",
    name: "Old Ottawa South Hardware",
    category: "shops",
    lat: 45.397,
    lng: -75.6848,
    address: "1136 Bank St, Ottawa, ON",
    phone: "(613) 555-0166",
    hours: "Mon–Sat · 8am–7pm · Sun 10am–5pm",
    status: "open",
    walking_minutes: 4,
    description_short: "Tools & garden supplies",
    description_long:
      "Family run since 1974. The kind of place where someone walks you to the right screw and asks how the renovation is going.",
  },
  {
    id: "riverside-hub",
    name: "Riverside Community Hub",
    category: "community",
    lat: 45.3924,
    lng: -75.692,
    address: "260 Sunnyside Ave, Ottawa, ON",
    phone: "(613) 555-0119",
    email: "hello@riversidehub.example",
    hours: "Mon–Fri · 9am–9pm",
    status: "open",
    walking_minutes: 8,
    description_short: "Community space · meeting rooms",
    description_long:
      "A community-run space with a free seed library, a tool-share, weekly potluck on Thursdays, and bookable rooms for neighbourhood groups.",
  },
  {
    id: "the-glebe-tap",
    name: "The Glebe Tap",
    category: "food",
    lat: 45.4031,
    lng: -75.6886,
    address: "858 Bank St, Ottawa, ON",
    phone: "(613) 555-0144",
    hours: "Wed–Sun · 4pm–11pm",
    status: "closed",
    walking_minutes: 12,
    description_short: "Local taproom · small plates",
    description_long:
      "Rotating taps from Ottawa Valley breweries and a short menu of things to share. Co-owned by two siblings from Old Ottawa East.",
  },
  {
    id: "bloom-florals",
    name: "Bloom Florals",
    category: "shops",
    lat: 45.3955,
    lng: -75.6855,
    address: "1112 Bank St, Ottawa, ON",
    phone: "(613) 555-0151",
    hours: "Tue–Sat · 10am–6pm",
    status: "open",
    walking_minutes: 3,
    description_short: "Seasonal florist",
    description_long:
      "Stems sourced from Ottawa Valley growers when the season allows. Walk-ins welcome; weddings booked months out.",
  },
  {
    id: "linden-press",
    name: "Linden Press",
    category: "arts",
    lat: 45.3982,
    lng: -75.6873,
    address: "44 Grosvenor Ave, Ottawa, ON",
    website: "https://lindenpress.example",
    hours: "Thu–Sat · 12pm–6pm",
    status: "closing-soon",
    walking_minutes: 6,
    description_short: "Letterpress & risograph",
    description_long:
      "A two-person studio printing zines, posters, and stationery on machines older than either of them. Open studio every first Saturday.",
  },
  {
    id: "willow-apothecary",
    name: "Willow Apothecary",
    category: "wellness",
    lat: 45.3947,
    lng: -75.6831,
    address: "1190 Bank St, Ottawa, ON",
    phone: "(613) 555-0177",
    hours: "Mon–Sat · 10am–6pm",
    status: "open",
    walking_minutes: 4,
    description_short: "Herbalist · tinctures",
    description_long:
      "A small herbalist shop run by Maya, formulating tinctures, balms, and teas from locally grown and wildcrafted plants.",
  },
];
