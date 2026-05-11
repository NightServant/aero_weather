import { getJSON } from "./client";
import type { AirQuality } from "./types";

const AQ_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

type RawAQ = {
  current: {
    time: string;
    us_aqi: number;
    pm2_5: number;
    pm10: number;
    ozone: number;
    nitrogen_dioxide: number;
  };
};

export async function getAirQuality(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<AirQuality> {
  const raw = await getJSON<RawAQ>(
    AQ_URL,
    {
      latitude: lat,
      longitude: lon,
      current: ["us_aqi", "pm2_5", "pm10", "ozone", "nitrogen_dioxide"],
      timezone: "auto",
    },
    { revalidate: 1800, signal },
  );
  return {
    time: raw.current.time,
    usAqi: raw.current.us_aqi,
    pm2_5: raw.current.pm2_5,
    pm10: raw.current.pm10,
    ozone: raw.current.ozone,
    no2: raw.current.nitrogen_dioxide,
  };
}

export function aqiCategory(aqi: number): "good" | "moderate" | "unhealthy-sg" | "unhealthy" | "very-unhealthy" | "hazardous" {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy-sg";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazardous";
}
