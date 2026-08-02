import type { Business } from "../../data/businesses";
import { BusinessCard } from "./BusinessCard";

export function BusinessList({
  items,
  onSelect,
  emptyMessage = "No places match your search.",
}: {
  items: Business[];
  onSelect: (id: string) => void;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="px-3 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5 px-1.5">
      {items.map((b) => (
        <BusinessCard
          key={b.id}
          business={b}
          onClick={() => onSelect(b.id)}
        />
      ))}
    </div>
  );
}
