"use client";

import { CityCard } from "./city-card";
import { CityCardSkeleton } from "./city-card-skeleton";
import { useCityForecast } from "./use-city-forecast";
import type { Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  place: Place;
  units: UnitPrefs;
  isActive: boolean;
};

/** Fetches the per-city forecast and swaps a shape-matched skeleton for the card. */
export function CityCardLoader({ place, units, isActive }: Props) {
  const forecast = useCityForecast(place, units);

  if (forecast === undefined) {
    return (
      <div aria-busy="true">
        <CityCardSkeleton />
      </div>
    );
  }

  return <CityCard place={place} forecast={forecast} unit={units.temperature} isActive={isActive} />;
}
