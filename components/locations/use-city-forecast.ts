"use client";

import { useEffect, useState } from "react";
import { getForecast } from "@/lib/api/forecast";
import type { Forecast, Place, UnitPrefs } from "@/lib/api/types";

/**
 * Per-city forecast fetch shared by the carousel cards and list rows.
 * `undefined` = loading (render a skeleton), `null` = request failed.
 */
export function useCityForecast(place: Place, units: UnitPrefs): Forecast | null | undefined {
  const [forecast, setForecast] = useState<Forecast | null | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    setForecast(undefined);
    getForecast(place.latitude, place.longitude, units, controller.signal)
      .then((f) => setForecast(f))
      .catch(() => {
        if (!controller.signal.aborted) setForecast(null);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.id, place.latitude, place.longitude, units.temperature, units.wind, units.precipitation]);

  return forecast;
}
