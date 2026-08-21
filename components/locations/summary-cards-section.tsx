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

  // Saved and Active run the full width below `sm`. Both carry text that has
  // no fixed length - the place name most of all - and a half-width column at
  // 320px broke "Bamban" across two lines mid-word. The two numeric metrics
  // stay two-up: their values are short and the density is worth keeping.
  const wide = "col-span-2 sm:col-span-1";

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-6 xl:grid-cols-4">
      <LocationSummaryCard
        className={wide}
        label="Saved"
        icon={<MapPin className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={summary.savedCount}
        unit={summary.savedCount === 1 ? "place" : "places"}
      >
        Weather across every place you follow.
      </LocationSummaryCard>

      <LocationSummaryCard
        className={wide}
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
        Mean across saved places.
      </LocationSummaryCard>

      <LocationSummaryCard
        label="Rain now"
        icon={<CloudRain className={iconCls} strokeWidth={1.5} aria-hidden="true" />}
        value={summary.rainCount}
        unit={summary.rainCount === 1 ? "place" : "places"}
        accent={summary.rainCount > 0}
      >
        {summary.rainCount > 0
          ? "Rain or showers right now."
          : "No rain reported right now."}
      </LocationSummaryCard>
    </div>
  );
}
