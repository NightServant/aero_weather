import { MapPin, Plus } from "lucide-react";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { formatTemp, tempUnitLabel } from "@/lib/format";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import type { Forecast, Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  place: Place;
  units: UnitPrefs;
  /** `undefined` = still loading, `null` = the batched fetch failed for this
   *  place. Same convention as useLocationForecasts / useCityForecast. */
  forecast: Forecast | null | undefined;
  onSelect: (place: Place) => void;
};

/**
 * One row of the /search "Suggested places" list: full column width, stacked
 * with hairline dividers rather than the photo-led carousel card. Shows the
 * live temperature and condition when the batched forecast for this place has
 * already loaded.
 */
export function SuggestedLocationRow({ place, units, forecast, onSelect }: Props) {
  const kind = forecast ? weatherCodeToKind(forecast.current.weatherCode) : null;
  const region = [place.admin1, place.country].filter(Boolean).join(", ");

  return (
    <li className="border-b border-[var(--hairline)] last:border-b-0">
      <button
        type="button"
        onClick={() => onSelect(place)}
        className="flex w-full items-center gap-3 py-3.5 text-left transition hover:bg-foreground/[0.04]"
      >
        <MapPin className="size-4 shrink-0 opacity-60" strokeWidth={1.5} aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">{place.name}</div>
          <div className="caption truncate">{region || place.countryCode}</div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {forecast === undefined ? (
            <span aria-hidden="true" className="size-5 rounded-full bg-white/10" />
          ) : forecast && kind ? (
            <>
              <AnimatedWeatherIcon kind={kind} isDay={forecast.current.isDay} size={20} />
              <span className="stat-value whitespace-nowrap">
                {formatTemp(forecast.current.temperature, units.temperature)}
                {tempUnitLabel(units.temperature)}
              </span>
              <span className="caption hidden truncate sm:inline">{WEATHER_LABEL[kind]}</span>
            </>
          ) : (
            <span className="caption">Unavailable</span>
          )}
        </div>

        <span
          aria-hidden="true"
          className="ml-1 grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-foreground/80"
        >
          <Plus className="size-4" strokeWidth={1.5} />
        </span>
      </button>
    </li>
  );
}
