import type { Status, StatusInfo } from "../../lib/hours";

const STATUS: Record<Status, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "#7BB661", bg: "rgba(123, 182, 97, 0.14)" },
  "closing-soon": {
    label: "Closing soon",
    color: "#E0A85B",
    bg: "rgba(224, 168, 91, 0.14)",
  },
  "opens-soon": {
    label: "Opens soon",
    color: "#E0A85B",
    bg: "rgba(224, 168, 91, 0.14)",
  },
  closed: { label: "Closed", color: "#E0685B", bg: "rgba(224, 104, 91, 0.14)" },
};

export const STATUS_COLORS: Record<Status, string> = {
  open: "#7BB661",
  "closing-soon": "#E0A85B",
  "opens-soon": "#E0A85B",
  closed: "#E0685B",
};

export function StatusPill({ info }: { info: StatusInfo | null }) {
  if (!info) return null;
  const s = STATUS[info.status];
  const label =
    info.status === "opens-soon" && info.opensAt
      ? `Opens ${info.opensAt}`
      : s.label;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {label}
    </span>
  );
}
