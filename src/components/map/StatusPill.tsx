import type { Business } from "../../data/businesses";

const STATUS = {
  open: { label: "Open", color: "#7BB661", bg: "rgba(123, 182, 97, 0.14)" },
  "closing-soon": {
    label: "Closes 5pm",
    color: "#E0A85B",
    bg: "rgba(224, 168, 91, 0.14)",
  },
  closed: { label: "Closed", color: "#E0685B", bg: "rgba(224, 104, 91, 0.14)" },
} as const;

export function StatusPill({ status }: { status: Business["status"] }) {
  const s = STATUS[status];
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
}
