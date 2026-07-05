"use client";

import { useEffect } from "react";
import { usePrefs } from "@/hooks/use-prefs";

/** Paints the manual sky palette from prefs onto <html>. When paletteMode is
 *  "auto" the ActiveForecastProvider overrides this with the weather-derived key. */
function SkySync() {
  const [prefs, , hydrated] = usePrefs();
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.palette = prefs.palette;
  }, [prefs.palette, hydrated]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkySync />
      {children}
    </>
  );
}
