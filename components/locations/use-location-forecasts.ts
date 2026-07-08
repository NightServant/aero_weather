"use client";

import { useEffect, useState } from "react";
import { getForecast } from "@/lib/api/forecast";
import type { Place, UnitPrefs } from "@/lib/api/types";
import type { ForecastMap } from "@/lib/locations-summary";

/**
 * Fetches every place's forecast once, in parallel, into a shared map keyed by
 * place id. Both the summary cards and the saved cards read from this, so each
 * city is fetched a single time. Entries are `undefined` while loading and
 * `null` on failure — same convention as `useCityForecast`.
 */
export function useLocationForecasts(places: Place[], units: UnitPrefs): ForecastMap {
  const [byId, setById] = useState<ForecastMap>({});

  // Re-fetch when the set of ids or any unit changes.
  const idsKey = places.map((p) => p.id).join(",");
  const unitsKey = `${units.temperature}|${units.wind}|${units.precipitation}`;

  useEffect(() => {
    const controller = new AbortController();
    // Seed loading state for the current ids; drop stale ids.
    setById(() => Object.fromEntries(places.map((p) => [p.id, undefined])) as ForecastMap);

    for (const place of places) {
      getForecast(place.latitude, place.longitude, units, controller.signal)
        .then((f) => setById((prev) => ({ ...prev, [place.id]: f })))
        .catch(() => {
          if (!controller.signal.aborted) {
            setById((prev) => ({ ...prev, [place.id]: null }));
          }
        });
    }
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, unitsKey]);

  return byId;
}
