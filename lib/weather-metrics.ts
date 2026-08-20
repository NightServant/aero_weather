/** Open-Meteo reports visibility in metres. */
export function formatVisibility(metres: number): string {
  if (!Number.isFinite(metres) || metres < 0) return "--";
  if (metres < 1000) return `${Math.round(metres / 100) * 100} m`;
  const km = metres / 1000;
  // Below 10km the first decimal still carries meaning (haze, fog lifting).
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

/** Plain-language visibility band, so the number is not the only signal. */
export function visibilityNote(metres: number): string {
  if (!Number.isFinite(metres) || metres < 0) return "No reading";
  if (metres < 1000) return "Fog, take care driving";
  if (metres < 4000) return "Hazy";
  if (metres < 10000) return "Slightly hazy";
  return "Clear line of sight";
}

/** How far the apparent temperature departs from the measured one. */
export function feelsLikeNote(apparent: number, actual: number): string {
  if (!Number.isFinite(apparent) || !Number.isFinite(actual)) return "No reading";
  const delta = Math.round(apparent) - Math.round(actual);
  if (delta === 0) return "Matches the actual reading";
  const size = Math.abs(delta);
  return `${size}° ${delta > 0 ? "warmer" : "cooler"} than actual`;
}

/** Okta-style description of sky cover. */
export function cloudCoverNote(percent: number): string {
  if (!Number.isFinite(percent) || percent < 0) return "No reading";
  if (percent < 12) return "Clear sky";
  if (percent < 38) return "Mostly clear";
  if (percent < 62) return "Partly cloudy";
  if (percent < 88) return "Mostly cloudy";
  return "Overcast";
}
