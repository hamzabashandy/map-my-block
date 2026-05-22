import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Splash,
  head: () => ({
    meta: [
      { title: "iCBIG — Neighbourhood directory" },
      {
        name: "description",
        content:
          "iCBIG is an Ottawa NGO connecting neighbours, businesses, and community organizations through a local directory and shared resources.",
      },
    ],
  }),
});

function Splash() {
  return (
    <main className="relative flex min-h-dvh flex-col bg-background text-foreground">
      <header className="px-6 pt-8 sm:px-10 sm:pt-10">
        <span className="font-serif tracking-tight text-6xl">iCBIG</span>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 sm:px-10">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <h1 className="sr-only">iCBIG — Neighbourhood directory</h1>
          <p className="text-balance text-[15px] leading-relaxed text-foreground/85 sm:text-base">
            iCBIG is an NGO working to strengthen local neighbourhoods and local
            economies by fostering collaboration between businesses, community
            organizations, residents, and students — through networking,
            knowledge exchange, community initiatives, neighbourhood-based
            action projects, and the development of shared local resource and
            skills databases. iCBIG serves as a connector and collaborative
            platform that supports more resilient, engaged, and sustainable
            local communities.
          </p>

          <Link
            to="/map"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-[15px] font-medium text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
          >
            Open the map
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <footer className="px-6 pb-8 sm:px-10 sm:pb-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-4">
            <a
              href="tel:+16135550100"
              className="transition-colors hover:text-foreground"
            >
              (613) 555-0100
            </a>
            <span aria-hidden className="text-foreground/20">
              ·
            </span>
            <a
              href="mailto:hello@icbig.ca"
              className="transition-colors hover:text-foreground"
            >
              hello@icbig.ca
            </a>
          </div>
          <a
            href="mailto:hello@icbig.ca"
            className="transition-colors hover:text-foreground"
          >
            Get in touch →
          </a>
        </div>
      </footer>
    </main>
  );
}
