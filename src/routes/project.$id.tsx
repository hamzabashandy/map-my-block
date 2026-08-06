import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { CATEGORIES, type Business } from "../data/businesses";
import { buildAdjacency, useBusinesses } from "../lib/data";

export const Route = createFileRoute("/project/$id")({
  component: ProjectPage,
  head: () => ({
    meta: [
      { title: "Project — iCBIG neighbourhood directory" },
      {
        name: "description",
        content:
          "A neighbourhood project and the people, places and groups it is connected to.",
      },
      { property: "og:title", content: "Project — iCBIG" },
      {
        property: "og:description",
        content:
          "A neighbourhood project and the people, places and groups it is connected to.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function BackControl() {
  return (
    <Link
      to="/map" search={{ select: undefined }}
      className="inline-flex items-center gap-2 text-[13px] text-white/55 transition-colors hover:text-white/90"
    >
      <ArrowLeft size={14} />
      Back to map
    </Link>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh w-full bg-background">
      <div className="mx-auto w-full max-w-[640px] px-5 py-8">
        <div className="mb-8">
          <BackControl />
        </div>
        {children}
      </div>
    </main>
  );
}

function ProjectPage() {
  const { id } = Route.useParams();
  const { items, loading } = useBusinesses();
  const adjacency = useMemo(() => buildAdjacency(items), [items]);

  const project = items.find((b) => b.id === id && b.category === "project");

  if (loading && items.length === 0) {
    return (
      <Shell>
        <p className="text-[13.5px] text-white/45">Loading project…</p>
      </Shell>
    );
  }

  if (!project) {
    return (
      <Shell>
        <h1 className="font-serif text-3xl tracking-tight">Project not found</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/50">
          We couldn't find a project with that link.
        </p>
      </Shell>
    );
  }

  const neighbours = (adjacency[project.id] ?? [])
    .map((nid) => items.find((b) => b.id === nid))
    .filter((b): b is Business => Boolean(b));

  return (
    <Shell>
      <h1 className="font-serif text-4xl leading-tight tracking-tight">
        {project.name}
      </h1>
      {project.description_short && (
        <p className="mt-3 text-[15px] leading-relaxed text-white/60">
          {project.description_short}
        </p>
      )}
      {project.description_long && (
        <p className="mt-6 whitespace-pre-line text-[14px] leading-relaxed text-white/75">
          {project.description_long}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-[12px] font-medium uppercase tracking-wide text-white/40">
          Connected to
        </h2>
        <div className="mt-3 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.06]">
          {neighbours.length === 0 && (
            <p className="px-3 py-4 text-[13px] text-white/40">
              No connections recorded yet.
            </p>
          )}
          {neighbours.map((n) => (
            <Link
              key={n.id}
              to="/map"
              search={{ select: n.id }}
              className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[0.05]"
            >
              <span
                className="mt-[6px] block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORIES[n.category].color }}
              />
              <span className="min-w-0">
                <span className="block text-[13.5px] font-medium text-white/90">
                  {n.name}
                </span>
                {n.description_short && (
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-white/45">
                    {n.description_short}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
