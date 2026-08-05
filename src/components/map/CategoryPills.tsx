import { X } from "lucide-react";
import { CATEGORIES, CATEGORY_LIST, type CategoryId } from "../../data/businesses";

export function CategoryPills({
  active,
  onToggle,
  categories,
  projectPill,
}: {
  active: Set<CategoryId>;
  onToggle: (id: CategoryId) => void;
  categories?: CategoryId[];
  projectPill?: { name: string; onDeactivate: () => void } | null;
}) {
  const list = categories
    ? CATEGORY_LIST.filter((c) => categories.includes(c.id)).sort(
        (a, b) => CATEGORY_LIST.indexOf(a) - CATEGORY_LIST.indexOf(b),
      )
    : CATEGORY_LIST;
  const project = CATEGORIES.project;
  return (
    <div className="-mx-1 flex flex-wrap gap-2 px-1">
      {list.map((cat) => {
        const Icon = cat.icon;
        const isActive = active.has(cat.id);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onToggle(cat.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-all"
            style={{
              backgroundColor: isActive ? cat.bg : "rgba(255,255,255,0.04)",
              color: isActive ? cat.color : "rgba(255,255,255,0.65)",
              boxShadow: isActive
                ? `inset 0 0 0 1px ${cat.color}40`
                : "inset 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        );
      })}

      {projectPill && (
        <button
          type="button"
          onClick={projectPill.onDeactivate}
          className="flex max-w-full shrink items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-all"
          style={{
            backgroundColor: project.bg,
            color: project.color,
            boxShadow: `inset 0 0 0 1px ${project.color}40`,
          }}
        >
          <project.icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{projectPill.name}</span>
          <X className="h-3 w-3 shrink-0" />
        </button>
      )}
    </div>
  );
}
