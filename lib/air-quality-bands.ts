export type AqiBand = {
  /** Category name as published by AirNow. */
  label: string;
  /** Band colour, matched to the palette's chroma rather than AirNow's flat hues. */
  color: string;
  advice: string;
};

/** US AQI category ceilings (AirNow). The last band is open-ended. */
const BANDS: { max: number; band: AqiBand }[] = [
  {
    max: 50,
    band: { label: "Good", color: "oklch(0.78 0.16 150)", advice: "Air quality is satisfactory." },
  },
  {
    max: 100,
    band: {
      label: "Moderate",
      color: "oklch(0.86 0.17 95)",
      advice: "Unusually sensitive people should take it easy outdoors.",
    },
  },
  {
    max: 150,
    band: {
      label: "Unhealthy for some",
      color: "oklch(0.74 0.17 55)",
      advice: "Sensitive groups should limit long outdoor exertion.",
    },
  },
  {
    max: 200,
    band: {
      label: "Unhealthy",
      color: "oklch(0.64 0.23 27)",
      advice: "Limit long outdoor exertion.",
    },
  },
  {
    max: 300,
    band: {
      label: "Very unhealthy",
      color: "oklch(0.60 0.22 320)",
      advice: "Avoid outdoor exertion.",
    },
  },
  {
    max: Number.POSITIVE_INFINITY,
    band: {
      label: "Hazardous",
      color: "oklch(0.52 0.20 15)",
      advice: "Stay indoors and keep exertion low.",
    },
  },
];

/** The scale the dial fills against; beyond this the reading simply pins full. */
export const AQI_DIAL_MAX = 300;

export function aqiBand(aqi: number): AqiBand {
  const value = Number.isFinite(aqi) ? Math.max(0, aqi) : 0;
  return (BANDS.find((b) => value <= b.max) ?? BANDS[BANDS.length - 1]).band;
}

/** Fraction of the dial to fill, clamped to 0..1. */
export function aqiDialFraction(aqi: number): number {
  if (!Number.isFinite(aqi)) return 0;
  return Math.min(1, Math.max(0, aqi / AQI_DIAL_MAX));
}
