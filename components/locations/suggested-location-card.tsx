"use client";

import { memo, useState } from "react";
import { Info, Plus, Check } from "lucide-react";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { CityPhoto } from "./city-photo";
import { CityCardSkeleton } from "./city-card-skeleton";
import { useCityForecast } from "./use-city-forecast";
import { formatTemp, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import type { Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  place: Place;
  units: UnitPrefs;
  onOpenDetails: (place: Place) => void;
  onSave: (place: Place) => void;
};

function SuggestedLocationCardBase({ place, units, onOpenDetails, onSave }: Props) {
  const forecast = useCityForecast(place, units);
  const [saving, setSaving] = useState(false);

  if (forecast === undefined) {
    return (
      <div aria-busy="true">
        <CityCardSkeleton />
      </div>
    );
  }

  const kind = forecast ? weatherCodeToKind(forecast.current.weatherCode) : null;
  const region = [place.admin1, place.country].filter(Boolean).join(", ");

  return (
    <div
      className="tint-card card-interactive relative w-full p-4 transition-[opacity,transform] duration-300"
      data-saving={saving ? "true" : undefined}
      style={saving ? { opacity: 0, transform: "scale(0.94)" } : undefined}
    >
      <div className="relative overflow-hidden rounded-[12px]">
        <CityPhoto place={place} width={208} height={247} className="h-[247px] w-full rounded-[12px]" initialClassName="text-6xl" />
      </div>

      <button
        type="button"
        onClick={() => onOpenDetails(place)}
        aria-label={`Details for ${place.name}`}
        className="absolute top-6 right-6 grid size-9 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/30 backdrop-blur-md transition-colors duration-150 hover:bg-black/60 focus-visible:bg-black/60"
      >
        <Info className="size-4" strokeWidth={1.5} aria-hidden="true" />
      </button>

      <div className="mt-3 min-w-0">
        <h3 className="truncate text-[0.9375rem] leading-snug font-semibold text-text-strong">{place.name}</h3>
        <p className="caption truncate">{region || place.countryCode}</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {kind ? (
          <AnimatedWeatherIcon kind={kind} isDay={forecast?.current.isDay ?? true} size={20} />
        ) : (
          <span aria-hidden="true" className="size-5 shrink-0 rounded-full bg-white/10" />
        )}
        <span className="stat-value whitespace-nowrap">
          {forecast ? `${formatTemp(forecast.current.temperature, units.temperature)}${tempUnitLabel(units.temperature)}` : "--"}
        </span>
        <span className="caption ml-auto truncate text-right">{kind ? WEATHER_LABEL[kind] : "Unavailable"}</span>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => {
          setSaving(true);
          // Let the exit animation play before the parent removes this card.
          window.setTimeout(() => onSave(place), 300);
        }}
        className="glass-pill mt-4 inline-flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-foreground/90 transition-colors hover:bg-white/[0.14] disabled:opacity-60"
      >
        {saving ? <Check className="size-4" strokeWidth={1.5} /> : <Plus className="size-4" strokeWidth={1.5} />}
        {saving ? "Saved" : "Save location"}
      </button>
    </div>
  );
}

export const SuggestedLocationCard = memo(SuggestedLocationCardBase);
