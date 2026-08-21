import type { Forecast } from "./api/types";
import { weatherCodeToKind } from "./api/weather-code";

export function summarizeWeek(forecast: Forecast): { title: string; subtitle: string } {
  const wetDays = forecast.daily.filter((d) => d.precipitationProbabilityMax >= 60);
  const stormDays = forecast.daily.filter((d) => {
    const k = weatherCodeToKind(d.weatherCode);
    return k === "thunderstorm" || k === "thunderstorm-hail";
  });
  const clearDays = forecast.daily.filter((d) => {
    const k = weatherCodeToKind(d.weatherCode);
    return k === "clear" || k === "mainly-clear";
  });

  if (stormDays.length >= 1) {
    return {
      title: "Storm system on the way",
      subtitle: "Thunderstorms likely midweek. Clear by the weekend.",
    };
  }
  if (wetDays.length >= 3) {
    return {
      title: "A wet stretch midweek",
      subtitle: "Storm system sweeps through. Clear and mild by the weekend.",
    };
  }
  if (clearDays.length >= 5) {
    return {
      title: "Bright skies all week",
      subtitle: "Sunshine holds across the seven-day outlook.",
    };
  }
  if (wetDays.length === 0) {
    return {
      title: "Settled week ahead",
      subtitle: "No significant precipitation in the seven-day window.",
    };
  }
  return {
    title: "Mixed week ahead",
    subtitle: "A few wetter days break up otherwise mild conditions.",
  };
}

export function summarizeToday(forecast: Forecast): string {
  const kind = weatherCodeToKind(forecast.current.weatherCode);
  const precipChance = forecast.hourly
    .slice(0, 12)
    .reduce((max, h) => Math.max(max, h.precipitationProbability), 0);

  // One short line under the greeting. It sits beside the hero at laptop
  // widths, where anything longer than roughly forty characters wraps and
  // pushes the temperature down, so these stay clipped to two clauses.
  if (kind === "thunderstorm" || kind === "thunderstorm-hail") {
    return "Storms moving through. Stay inside.";
  }
  if (kind === "rain" || kind === "rain-showers" || kind === "drizzle") {
    return "Wet out there. Take a jacket.";
  }
  if (kind === "snow" || kind === "snow-showers") {
    return "Snow today. Roads will be slow.";
  }
  if (kind === "clear" || kind === "mainly-clear") {
    if (precipChance > 30) {
      return "Clear for now, showers later.";
    }
    return "Clear and settled. Good day to be out.";
  }
  if (kind === "partly-cloudy") {
    return "Sun and cloud, mild all day.";
  }
  if (kind === "fog") {
    return "Fog is sitting low. Drive slow.";
  }
  return "Mixed day. Keep a layer handy.";
}
