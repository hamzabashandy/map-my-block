import {
  Store,
  Users,
  Landmark,
  Hammer,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import type { Hours } from "../lib/hours";

export type CategoryId =
  | "business"
  | "community_group"
  | "institution"
  | "project"
  | "services_facilitator";

export type Business = {
  id: string;
  name: string;
  category: CategoryId;
  lat?: number;
  lng?: number;
  /** true when both lat and lng are finite numbers */
  mapped: boolean;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  /** per-day opening hours; null = no fixed hours that day */
  hours: Hours;
  description_short: string;
  description_long: string;
  photo_url?: string;
  /** ids of other entries this one is connected to (as recorded on this row) */
  connection_ids?: string[];
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
  business: {
    id: "business",
    label: "Businesses",
    icon: Store,
    color: "#E0A85B",
    bg: "rgba(224, 168, 91, 0.16)",
  },
  community_group: {
    id: "community_group",
    label: "Community groups",
    icon: Users,
    color: "#7BB661",
    bg: "rgba(123, 182, 97, 0.16)",
  },
  institution: {
    id: "institution",
    label: "Institutions",
    icon: Landmark,
    color: "#5B9BE0",
    bg: "rgba(91, 155, 224, 0.16)",
  },
  project: {
    id: "project",
    label: "Projects",
    icon: Hammer,
    color: "#D85A30",
    bg: "rgba(216, 90, 48, 0.16)",
  },
  services_facilitator: {
    id: "services_facilitator",
    label: "Services & facilitators",
    icon: Handshake,
    color: "#9B8BE0",
    bg: "rgba(155, 139, 224, 0.16)",
  },
};

export const CATEGORY_LIST: CategoryMeta[] = [
  CATEGORIES.business,
  CATEGORIES.community_group,
  CATEGORIES.institution,
  CATEGORIES.project,
  CATEGORIES.services_facilitator,
];

const WEEKDAYS_9_5: Hours = {
  mon: "09:00-17:00",
  tue: "09:00-17:00",
  wed: "09:00-17:00",
  thu: "09:00-17:00",
  fri: "09:00-17:00",
  sat: "closed",
  sun: "closed",
};

const NO_HOURS: Hours = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
};

export const BUSINESSES: Business[] = [
  {
    id: "canal-coffee",
    name: "Canal Coffee",
    category: "business",
    lat: 45.3994,
    lng: -75.6862,
    mapped: true,
    address: "1089 Bank St, Ottawa, ON",
    phone: "(613) 555-0187",
    hours: {
      mon: "07:00-17:00",
      tue: "07:00-17:00",
      wed: "07:00-17:00",
      thu: "07:00-17:00",
      fri: "07:00-17:00",
      sat: "08:00-16:00",
      sun: "08:00-16:00",
    },
    description_short: "Espresso & pastries",
    description_long:
      "A two-table espresso bar across from the canal. Beans roasted in Hintonburg, sourdough from the bakery next door.",
  },
  {
    id: "riverside-hub",
    name: "Riverside Community Hub",
    category: "community_group",
    lat: 45.3924,
    lng: -75.692,
    mapped: true,
    address: "260 Sunnyside Ave, Ottawa, ON",
    email: "hello@riversidehub.example",
    hours: WEEKDAYS_9_5,
    description_short: "Community space · meeting rooms",
    description_long:
      "A community-run space with a free seed library, a tool-share, and bookable rooms for neighbourhood groups.",
  },
  {
    id: "sunnyside-library",
    name: "Sunnyside Branch Library",
    category: "institution",
    lat: 45.3939,
    lng: -75.6845,
    mapped: true,
    address: "1049 Bank St, Ottawa, ON",
    hours: {
      mon: "10:00-20:00",
      tue: "10:00-20:00",
      wed: "10:00-20:00",
      thu: "10:00-20:00",
      fri: "10:00-20:00",
      sat: "10:00-17:00",
      sun: "closed",
    },
    description_short: "Public library branch",
    description_long:
      "A small neighbourhood branch with study space, community noticeboards, and weekly storytime.",
  },
  {
    id: "canal-cleanup",
    name: "Canal Cleanup Project",
    category: "project",
    mapped: false,
    address: "",
    email: "hello@betweenthebridges.ca",
    hours: NO_HOURS,
    description_short: "Volunteer shoreline cleanups",
    description_long:
      "A neighbour-organised effort to clear litter along the canal pathways twice a year. No fixed address — meeting points change each season.",
  },
];
