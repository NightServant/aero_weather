export type WeatherKind =
  | "clear"
  | "mainly-clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "freezing-rain"
  | "snow"
  | "snow-showers"
  | "rain-showers"
  | "thunderstorm"
  | "thunderstorm-hail";

export function weatherCodeToKind(code: number): WeatherKind {
  if (code === 0) return "clear";
  if (code === 1) return "mainly-clear";
  if (code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code === 66 || code === 67) return "freezing-rain";
  if (code >= 61 && code <= 65) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain-showers";
  if (code === 85 || code === 86) return "snow-showers";
  if (code === 95) return "thunderstorm";
  if (code === 96 || code === 99) return "thunderstorm-hail";
  return "cloudy";
}

export const WEATHER_LABEL: Record<WeatherKind, string> = {
  clear: "Clear",
  "mainly-clear": "Mainly clear",
  "partly-cloudy": "Partly cloudy",
  cloudy: "Cloudy",
  fog: "Fog",
  drizzle: "Drizzle",
  rain: "Rain",
  "freezing-rain": "Freezing rain",
  snow: "Snow",
  "snow-showers": "Snow showers",
  "rain-showers": "Rain showers",
  thunderstorm: "Thunderstorm",
  "thunderstorm-hail": "Thunderstorm with hail",
};
