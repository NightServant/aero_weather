"use client";

import { useEffect, useState } from "react";
import { getForecast } from "@/lib/api/forecast";
import { getAirQuality } from "@/lib/api/air-quality";
import type { AirQuality, Forecast, UnitPrefs } from "@/lib/api/types";

export type ForecastResult = {
  data: Forecast | null;
  airQuality: AirQuality | null;
  loading: boolean;
  error: Error | null;
};

export function useForecast(
  lat: number | null,
  lon: number | null,
  units: UnitPrefs,
): ForecastResult {
  const [state, setState] = useState<ForecastResult>({
    data: null,
    airQuality: null,
    loading: lat != null && lon != null,
    error: null,
  });

  useEffect(() => {
    if (lat == null || lon == null) {
      setState({ data: null, airQuality: null, loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.all([
      getForecast(lat, lon, units, controller.signal),
      getAirQuality(lat, lon, controller.signal).catch(() => null),
    ])
      .then(([data, airQuality]) => {
        setState({ data, airQuality, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setState({
          data: null,
          airQuality: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });
    return () => controller.abort();
  }, [lat, lon, units.temperature, units.wind, units.precipitation]);

  return state;
}
