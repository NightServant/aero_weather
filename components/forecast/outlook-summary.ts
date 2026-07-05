import type { Forecast } from "@/lib/api/types";
import { weatherCodeToKind } from "@/lib/api/weather-code";

/** Data-driven headline for the 14-day outlook (spec 8: no canned copy). */
export function summarizeOutlook(forecast: Forecast): { title: string; subtitle: string } {
  const days = forecast.daily;
  const wet = days.filter((d) => d.precipitationProbabilityMax >= 60).length;
  const storms = days.filter((d) => {
    const k = weatherCodeToKind(d.weatherCode);
    return k === "thunderstorm" || k === "thunderstorm-hail";
  }).length;
  const clear = days.filter((d) => {
    const k = weatherCodeToKind(d.weatherCode);
    return k === "clear" || k === "mainly-clear";
  }).length;
  const snow = days.filter((d) => {
    const k = weatherCodeToKind(d.weatherCode);
    return k === "snow" || k === "snow-showers";
  }).length;

  if (storms >= 2) {
    return {
      title: "Storms in the outlook.",
      subtitle: `Thunderstorms possible on ${storms} of the next ${days.length} days.`,
    };
  }
  if (snow >= 3) {
    return {
      title: "A snowy stretch ahead.",
      subtitle: `Snow expected on ${snow} of the next ${days.length} days.`,
    };
  }
  if (wet >= 6) {
    return {
      title: "A wet two weeks ahead.",
      subtitle: `Rain likely on ${wet} of the next ${days.length} days.`,
    };
  }
  if (clear >= 9) {
    return {
      title: "Bright skies in 2 weeks.",
      subtitle: "Sunshine holds across the 2-week outlook.",
    };
  }
  if (wet <= 1) {
    return {
      title: "A settled two weeks.",
      subtitle: "No significant precipitation in the 2-week window.",
    };
  }
  return {
    title: "A mixed two weeks ahead.",
    subtitle: `${wet} wetter ${wet === 1 ? "day breaks" : "days break"} up otherwise mild conditions.`,
  };
}
