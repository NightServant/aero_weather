import type { PaletteKey } from "./prefs";
import type { WeatherKind } from "./api/weather-code";

export const PALETTES: { key: PaletteKey; label: string; swatch: string }[] = [
  { key: "sunny", label: "Sunny", swatch: "oklch(0.88 0.1 75)" },
  { key: "sunset", label: "Sunset", swatch: "oklch(0.66 0.18 25)" },
  { key: "rainy", label: "Rainy", swatch: "oklch(0.6 0.06 240)" },
  { key: "stormy", label: "Stormy", swatch: "oklch(0.24 0.05 270)" },
  { key: "cloudy", label: "Cloudy", swatch: "oklch(0.84 0.012 245)" },
  { key: "snowy", label: "Snowy", swatch: "oklch(0.94 0.025 185)" },
  { key: "night", label: "Night", swatch: "oklch(0.18 0.06 275)" },
];

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
