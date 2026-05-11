"use client";

import { useEffect, useState } from "react";
import { CityCard } from "./city-card";
import { getForecast } from "@/lib/api/forecast";
import type { Forecast, Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  place: Place;
  units: UnitPrefs;
  format12h: boolean;
  isActive: boolean;
};

export function CityCardLoader({ place, units, format12h, isActive }: Props) {
  const [forecast, setForecast] = useState<Forecast | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getForecast(place.latitude, place.longitude, units, controller.signal)
      .then((f) => setForecast(f))
      .catch(() => null);
    return () => controller.abort();
  }, [place.id, place.latitude, place.longitude, units.temperature, units.wind, units.precipitation]);

  return (
    <CityCard
      place={place}
      forecast={forecast}
      unit={units.temperature}
      format12h={format12h}
      isActive={isActive}
    />
  );
}
