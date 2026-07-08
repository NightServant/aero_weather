"use client";

import { memo } from "react";
import { Info } from "lucide-react";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { CityPhoto } from "./city-photo";
import { CityCardSkeleton } from "./city-card-skeleton";
import { formatTemp, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import type { Forecast, Place, TempUnit } from "@/lib/api/types";

type Props = {
  place: Place;
  /** undefined = loading (skeleton), null = failed, else the forecast. */
  forecast: Forecast | null | undefined;
  unit: TempUnit;
  onOpenDetails: (place: Place) => void;
};

function SavedLocationCardBase({ place, forecast, unit, onOpenDetails }: Props) {
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
    <div className="tint-card card-interactive relative w-full p-4">
      <div className="relative overflow-hidden rounded-[12px]">
        <CityPhoto
          place={place}
          width={208}
          height={160}
          className="h-[160px] w-full rounded-[12px]"
          initialClassName="text-5xl"
        />
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
        <h3 className="truncate text-[0.9375rem] leading-snug font-semibold text-text-strong">
          {place.name}
        </h3>
        <p className="caption truncate">{region || place.countryCode}</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {kind ? (
          <AnimatedWeatherIcon kind={kind} isDay={forecast?.current.isDay ?? true} size={20} />
        ) : (
          <span aria-hidden="true" className="size-5 shrink-0 rounded-full bg-white/10" />
        )}
        <span className="stat-value whitespace-nowrap">
          {forecast ? `${formatTemp(forecast.current.temperature, unit)}${tempUnitLabel(unit)}` : "--"}
        </span>
        <span className="caption ml-auto truncate text-right">
          {kind ? WEATHER_LABEL[kind] : "Unavailable"}
        </span>
      </div>
    </div>
  );
}

export const SavedLocationCard = memo(SavedLocationCardBase);
