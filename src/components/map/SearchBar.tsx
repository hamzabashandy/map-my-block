import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPointerDown={stop}
        onTouchStart={stop}
        onMouseDown={stop}
        placeholder="Search businesses, makers, places…"
        className="w-full rounded-xl bg-white/[0.06] py-2.5 pl-10 pr-3 text-[14px] text-foreground placeholder:text-white/35 outline-none ring-1 ring-white/[0.06] transition focus:bg-white/[0.08] focus:ring-white/15"
      />
    </div>
  );
}
