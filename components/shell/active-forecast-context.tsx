"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { useForecast } from "@/hooks/use-forecast";
import { usePrefs } from "@/hooks/use-prefs";
import { activeLocation } from "@/lib/prefs";
import { paletteFromWeather } from "@/lib/theme";
import { weatherCodeToKind } from "@/lib/api/weather-code";
import type { ForecastResult } from "@/hooks/use-forecast";
import type { Place } from "@/lib/api/types";
import type { PaletteKey } from "@/lib/prefs";

type ActiveForecastContextValue = ForecastResult & {
  place: Place | null;
  derivedPalette: PaletteKey | null;
  /** Resolved sky key: weather-derived when `paletteMode` is auto, else the manual pref. */
  paletteKey: PaletteKey;
  hydrated: boolean;
};

const ActiveForecastContext = createContext<ActiveForecastContextValue | null>(null);

export function ActiveForecastProvider({ children }: { children: React.ReactNode }) {
  const [prefs, , hydrated] = usePrefs();
  const place = activeLocation(prefs);
  const result = useForecast(place?.latitude ?? null, place?.longitude ?? null, prefs.units);

  const derivedPalette = useMemo<PaletteKey | null>(() => {
    if (!result.data) return null;
    const kind = weatherCodeToKind(result.data.current.weatherCode);
    return paletteFromWeather(kind, result.data.current.isDay);
  }, [result.data]);

  // Mirrors the palette sync below so consumers (e.g. SkyBackground) always agree
  // with the `[data-palette]` variables painted on <html>.
  const paletteKey = useMemo<PaletteKey>(() => {
    if (prefs.paletteMode === "auto" && derivedPalette) return derivedPalette;
    return prefs.palette;
  }, [derivedPalette, prefs.paletteMode, prefs.palette]);

  useEffect(() => {
    if (!hydrated) return;
    if (prefs.paletteMode === "auto" && derivedPalette) {
      document.documentElement.dataset.palette = derivedPalette;
    } else {
      document.documentElement.dataset.palette = prefs.palette;
    }
  }, [derivedPalette, prefs.palette, prefs.paletteMode, hydrated]);

  const value: ActiveForecastContextValue = {
    ...result,
    place,
    derivedPalette,
    paletteKey,
    hydrated,
  };

  return (
    <ActiveForecastContext.Provider value={value}>{children}</ActiveForecastContext.Provider>
  );
}

export function useActiveForecast(): ActiveForecastContextValue {
  const ctx = useContext(ActiveForecastContext);
  if (!ctx) {
    throw new Error("useActiveForecast must be used inside ActiveForecastProvider");
  }
  return ctx;
}
