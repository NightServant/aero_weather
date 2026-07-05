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

  if (kind === "thunderstorm" || kind === "thunderstorm-hail") {
    return "Severe weather is moving through - stay indoors when storms arrive.";
  }
  if (kind === "rain" || kind === "rain-showers" || kind === "drizzle") {
    return "Rain through the day - a waterproof layer is the right call.";
  }
  if (kind === "snow" || kind === "snow-showers") {
    return "Snow is in the forecast - leave time for slower travel.";
  }
  if (kind === "clear" || kind === "mainly-clear") {
    if (precipChance > 30) {
      return "A bright window before evening showers - pack a light layer for the commute.";
    }
    return "A bright, settled day - good time to be outside.";
  }
  if (kind === "partly-cloudy") {
    return "Sun and cloud through the day - comfortable across the board.";
  }
  if (kind === "fog") {
    return "Fog is hanging on - visibility will improve through the morning.";
  }
  return "A mixed day ahead - keep a layer handy.";
}
