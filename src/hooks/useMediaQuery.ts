import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook.
 * Always returns `false` on the server and during the first client render
 * to guarantee identical hydration output. After mount, it reflects the
 * actual match value and listens for changes.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
