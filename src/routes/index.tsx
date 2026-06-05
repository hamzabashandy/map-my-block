import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import videoAsset from "@/assets/ICBIRG_Placeholder.mov.asset.json";

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

const PLAYBACK_RATE = 0.5;
const HOLD_MS = 10000;
const FADE_MS = 1500;
const BASE_OPACITY = 0.6;

function Splash() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = PLAYBACK_RATE;

    let timeouts: ReturnType<typeof setTimeout>[] = [];

    const onRate = () => {
      video.playbackRate = PLAYBACK_RATE;
    };

    const onEnded = () => {
      // Hold on last frame
      timeouts.push(
        setTimeout(() => {
          // Fade out
          video.style.opacity = "0";
          timeouts.push(
            setTimeout(() => {
              video.currentTime = 0;
              video.playbackRate = PLAYBACK_RATE;
              void video.play();
              // Fade back in
              requestAnimationFrame(() => {
                video.style.opacity = String(BASE_OPACITY);
              });
            }, FADE_MS),
          );
        }, HOLD_MS),
      );
    };

    video.addEventListener("ratechange", onRate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("ratechange", onRate);
      video.removeEventListener("ended", onEnded);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <main className="relative flex min-h-dvh flex-col text-foreground">
      <video
        ref={videoRef}
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full object-cover"
        style={{ opacity: BASE_OPACITY, transition: `opacity ${FADE_MS}ms ease-in-out` }}
        autoPlay
        muted
        playsInline
        preload="auto"
        src={videoAsset.url}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background/40" />

      <header className="px-6 pt-8 sm:px-10 sm:pt-10">
        <span className="font-serif tracking-tight text-6xl">iCBIG</span>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 sm:px-10">
        <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
          <h1 className="sr-only">iCBIG — Neighbourhood directory</h1>
          <p className="text-balance text-lg leading-relaxed text-foreground/85 sm:text-xl">
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
