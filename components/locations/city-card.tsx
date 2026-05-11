"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { WeatherIcon } from "@/components/today/weather-icon";
import { formatTemp, tempUnitLabel, formatTime } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import { paletteFromWeather } from "@/lib/theme";
import { usePrefs } from "@/hooks/use-prefs";
import type { Forecast, Place, TempUnit } from "@/lib/api/types";

type Props = {
  place: Place;
  forecast: Forecast | null;
  unit: TempUnit;
  format12h: boolean;
  isActive: boolean;
};

export function CityCard({ place, forecast, unit, format12h, isActive }: Props) {
  const [, setPrefs] = usePrefs();
  const router = useRouter();

  const palette = forecast
    ? paletteFromWeather(weatherCodeToKind(forecast.current.weatherCode), forecast.current.isDay)
    : "cloudy";

  const onClick = () => {
    setPrefs({ activeLocationId: place.id });
    router.push("/today");
  };

  const localTime = forecast ? formatTime(new Date().toISOString(), format12h, forecast.place.timezone) : "—";
  const kind = forecast ? weatherCodeToKind(forecast.current.weatherCode) : "cloudy";

  return (
    <button
      type="button"
      onClick={onClick}
      data-palette={palette}
      style={{ color: "var(--hero-text)" }}
      className={cn(
        "group relative isolate overflow-hidden rounded-3xl p-5 text-left transition hero-gradient grain-overlay border border-[var(--hairline-strong)]",
        "min-h-[180px]",
        isActive && "ring-2 ring-[var(--palette-accent)]/70",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight">{place.name}</h3>
            {isActive ? (
              <span
                style={{ backgroundColor: "color-mix(in oklch, var(--hero-text) 16%, transparent)" }}
                className="rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase backdrop-blur"
              >
                Home
              </span>
            ) : null}
          </div>
          <div className="text-xs opacity-75">{[place.admin1, place.country].filter(Boolean).join(", ")}</div>
        </div>
        <div className="opacity-90">
          <WeatherIcon kind={kind} isDay={forecast?.current.isDay ?? true} className="size-7" />
        </div>
      </div>

      <div className="absolute right-5 top-14 text-xs opacity-75 tabular">{localTime}</div>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-6xl font-extralight tracking-tighter tabular">
          {forecast ? formatTemp(forecast.current.temperature, unit, false) : "—"}
        </span>
        <span className="pb-3 text-lg opacity-85">°</span>
      </div>

      <div className="mt-4 flex items-baseline justify-between text-xs opacity-90">
        <span>{forecast ? WEATHER_LABEL[kind] : "Loading"}</span>
        {forecast ? (
          <span className="tabular">
            H {formatTemp(forecast.daily[0].tempMax, unit)}{tempUnitLabel(unit)} · L {formatTemp(forecast.daily[0].tempMin, unit)}{tempUnitLabel(unit)}
          </span>
        ) : null}
      </div>
    </button>
  );
}
