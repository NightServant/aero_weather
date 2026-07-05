"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { formatTemp, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import { usePrefs } from "@/hooks/use-prefs";
import { CityPhoto } from "./city-photo";
import { useCityForecast } from "./use-city-forecast";
import type { Forecast, Place, TempUnit, UnitPrefs } from "@/lib/api/types";

type Props = {
  places: Place[];
  units: UnitPrefs;
  activeId: number | undefined;
};

/** List tab: 64px tint-card rows with a 48px photo thumb, name + region and a
 *  right-aligned temp + condition icon. Same click-to-activate behavior. */
export function LocationsList({ places, units, activeId }: Props) {
  return (
    <ul className="space-y-3">
      {places.map((place) => (
        <li key={place.id}>
          <CityListRow place={place} units={units} isActive={place.id === activeId} />
        </li>
      ))}
    </ul>
  );
}

function CityListRow({
  place,
  units,
  isActive,
}: {
  place: Place;
  units: UnitPrefs;
  isActive: boolean;
}) {
  const [, setPrefs] = usePrefs();
  const router = useRouter();
  const forecast = useCityForecast(place, units);

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
      aria-busy={forecast === undefined || undefined}
      className={cn(
        "tint-card card-interactive flex h-16 w-full items-center gap-3 p-2 pr-4 text-left",
        isActive && "ring-2 ring-primary/60",
      )}
    >
      <CityPhoto
        place={place}
        width={48}
        height={48}
        className="size-12 rounded-lg"
        initialClassName="text-lg"
      />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] leading-snug font-semibold text-text-strong">
          {place.name}
        </span>
        <span className="caption block truncate">{region || place.countryCode}</span>
      </span>

      {isActive ? (
        <span className="glass-pill hidden shrink-0 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-foreground sm:inline-block">
          Active
        </span>
      ) : null}

      <RowWeather forecast={forecast} unit={units.temperature} />
    </button>
  );
}

function RowWeather({
  forecast,
  unit,
}: {
  forecast: Forecast | null | undefined;
  unit: TempUnit;
}) {
  if (forecast === undefined) {
    return (
      <span aria-hidden="true" className="flex shrink-0 items-center gap-2">
        <span className="size-5 animate-pulse rounded-full bg-white/10" />
        <span className="h-5 w-12 animate-pulse rounded bg-white/10" />
      </span>
    );
  }

  if (forecast === null) {
    return <span className="caption shrink-0">Unavailable</span>;
  }

  const kind = weatherCodeToKind(forecast.current.weatherCode);

  return (
    <span className="flex shrink-0 items-center gap-2">
      <span className="caption hidden max-w-32 truncate text-right md:block">
        {WEATHER_LABEL[kind]}
      </span>
      <span className="stat-value whitespace-nowrap">
        {formatTemp(forecast.current.temperature, unit)}
        {tempUnitLabel(unit)}
      </span>
      <AnimatedWeatherIcon kind={kind} isDay={forecast.current.isDay} size={20} />
    </span>
  );
}
