import { CATEGORIES, type Business } from "../../data/businesses";
import { useLiveStatus } from "../../lib/hours";
import { StatusPill } from "./StatusPill";

export function BusinessCard({
  business,
  onClick,
}: {
  business: Business;
  onClick: () => void;
}) {
  const cat = CATEGORIES[business.category];
  const Icon = cat.icon;
  const status = useLiveStatus(business.hours);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: cat.bg, color: cat.color }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-foreground">
          {business.name}
        </span>
        <span className="block truncate text-[12.5px] text-muted-foreground">
          {business.description_short}
        </span>
      </span>
      <StatusPill info={status} />
    </button>
  );
}
