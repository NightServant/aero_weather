import type { PaletteKey } from "./prefs";
import type { WeatherKind } from "./api/weather-code";

export function paletteFromWeather(kind: WeatherKind, isDay: boolean): PaletteKey {
  if (!isDay) return "night";
  switch (kind) {
    case "clear":
    case "mainly-clear":
    case "partly-cloudy":
      return "sunny";
    case "cloudy":
    case "fog":
      return "cloudy";
    case "drizzle":
    case "rain":
    case "rain-showers":
    case "freezing-rain":
      return "rainy";
    case "thunderstorm":
    case "thunderstorm-hail":
      return "stormy";
    case "snow":
    case "snow-showers":
      return "snowy";
    default:
      return "cloudy";
  }
}
