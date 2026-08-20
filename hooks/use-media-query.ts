"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reads a media query without mirroring it into state from an effect, which
 * cascades a render on every match change and is what `useIsMobile` does.
 *
 * The server has no viewport, so the server snapshot is always `false`: a
 * component branching on this renders its wide-screen form during SSR and
 * swaps on hydration. Prefer CSS where a branch is purely visual; use this
 * only where the two branches are genuinely different components.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
