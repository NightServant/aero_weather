"use client";

import { memo } from "react";
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
    <div className="group tint-card card-interactive relative w-full p-4">
      {/* The whole surface is the click target. There is no badge over the
          photo marking it: the circle that used to sit there was decoration,
          not a control, and a photo, a name, a reading and a glyph is already
          enough for one card to carry. */}
      <button
        type="button"
        onClick={() => onOpenDetails(place)}
        aria-label={`Details for ${place.name}`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      />

      <div className="relative overflow-hidden rounded-[12px]">
        <CityPhoto
          place={place}
          width={208}
          height={160}
          className="h-[160px] w-full rounded-[12px]"
          initialClassName="text-5xl"
        />
      </div>

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
