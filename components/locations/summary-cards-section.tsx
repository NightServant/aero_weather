"use client";

import { MapPin, Star, Thermometer, CloudRain } from "lucide-react";
import { LocationSummaryCard } from "./location-summary-card";
import { summarizeLocations } from "@/lib/locations-summary";
import { formatTemp, tempUnitLabel } from "@/lib/format";
import type { ForecastMap } from "@/lib/locations-summary";
import type { Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  places: Place[];
  forecasts: ForecastMap;
  activeId: number | null;
  units: UnitPrefs;
};

export function SummaryCardsSection({ places, forecasts, activeId, units }: Props) {
  const ids = places.map((p) => p.id);
  const summary = summarizeLocations(ids, forecasts, activeId, units.temperature);
  const active = places.find((p) => p.id === activeId) ?? places[0];
  const iconCls = "size-4";

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <LocationSummaryCard
        label="Saved"
        icon={<MapPin className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={summary.savedCount}
        unit={summary.savedCount === 1 ? "place" : "places"}
      >
        Weather across every place you follow.
      </LocationSummaryCard>

      <LocationSummaryCard
        label="Active"
        icon={<Star className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={active?.name ?? "—"}
      >
        {active
          ? [active.admin1, active.country].filter(Boolean).join(", ") || active.countryCode
          : "Pick a place to view its forecast."}
      </LocationSummaryCard>

      <LocationSummaryCard
        label="Average temp"
        icon={<Thermometer className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={summary.avgTemp == null ? "—" : formatTemp(summary.avgTemp, units.temperature, false)}
        unit={summary.avgTemp == null ? undefined : `°${tempUnitLabel(units.temperature)}`}
      >
        Mean of current temperatures across saved places.
      </LocationSummaryCard>

      <LocationSummaryCard
        label="Rain now"
        icon={<CloudRain className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={summary.rainCount}
        unit={summary.rainCount === 1 ? "place" : "places"}
        accent={summary.rainCount > 0}
      >
        {summary.rainCount > 0
          ? "Currently seeing rain or showers."
          : "No rain reported right now."}
      </LocationSummaryCard>
    </div>
  );
}
