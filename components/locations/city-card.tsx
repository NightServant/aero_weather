"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { formatTemp, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import { usePrefs } from "@/hooks/use-prefs";
import { CityPhoto } from "./city-photo";
import type { Forecast, Place, TempUnit } from "@/lib/api/types";

type Props = {
  place: Place;
  /** null = forecast request failed (loader shows a skeleton while loading). */
  forecast: Forecast | null;
  unit: TempUnit;
  isActive: boolean;
};

/**
 * Figma city card: 240px tint card, 16px padding, 208x247 photo (radius 12),
 * name + region on 2 lines, then weather icon + temp + condition row.
 * Clicking pins the place as the active location and returns to Today.
 */
export function CityCard({ place, forecast, unit, isActive }: Props) {
  const [, setPrefs] = usePrefs();
  const router = useRouter();

  const kind = forecast ? weatherCodeToKind(forecast.current.weatherCode) : null;
  const region = [place.admin1, place.country].filter(Boolean).join(", ");

  const onClick = () => {
    setPrefs({ activeLocationId: place.id });
    router.push("/today");
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "tint-card card-interactive block w-full p-4 text-left",
        isActive && "ring-2 ring-primary/60",
      )}
    >
      <div className="relative">
        <CityPhoto
          place={place}
          width={208}
          height={247}
          className="h-[247px] w-full rounded-[12px]"
          initialClassName="text-6xl"
        />
        {isActive ? (
          <span className="glass-pill absolute top-2 left-2 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground">
            Active
          </span>
        ) : null}
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
          {forecast
            ? `${formatTemp(forecast.current.temperature, unit)}${tempUnitLabel(unit)}`
            : "--"}
        </span>
        <span className="caption ml-auto truncate text-right">
          {kind ? WEATHER_LABEL[kind] : "Unavailable"}
        </span>
      </div>
    </button>
  );
}
