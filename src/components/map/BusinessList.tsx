import type { Business } from "../../data/businesses";
import { BusinessCard } from "./BusinessCard";

export function BusinessList({
  items,
  onSelect,
}: {
  items: Business[];
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="px-3 py-10 text-center text-sm text-muted-foreground">
        No places match your search.
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
