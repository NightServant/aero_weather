import { getJSON } from "./client";
import type { Forecast, UnitPrefs } from "./types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "precipitation",
  "weather_code",
  "wind_speed_10m",
  "wind_direction_10m",
  "is_day",
  "surface_pressure",
  "cloud_cover",
  "visibility",
  "uv_index",
];

const HOURLY_FIELDS = [
  "temperature_2m",
  "precipitation_probability",
  "weather_code",
  "is_day",
];

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "sunrise",
  "sunset",
  "uv_index_max",
];

type RawForecast = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: Record<string, number | string>;
  hourly: Record<string, (number | string)[]>;
  daily: Record<string, (number | string)[]>;
};

export async function getForecast(
  lat: number,
  lon: number,
  units: UnitPrefs,
  signal?: AbortSignal,
): Promise<Forecast> {
  const raw = await getJSON<RawForecast>(
    FORECAST_URL,
    {
      latitude: lat,
      longitude: lon,
      current: CURRENT_FIELDS,
      hourly: HOURLY_FIELDS,
      daily: DAILY_FIELDS,
      temperature_unit: units.temperature,
      wind_speed_unit: units.wind,
      precipitation_unit: units.precipitation,
      timezone: "auto",
      forecast_days: 7,
      forecast_hours: 24,
    },
    { revalidate: 600, signal },
  );

  return {
    place: { latitude: raw.latitude, longitude: raw.longitude, timezone: raw.timezone },
    current: {
      time: String(raw.current.time),
      temperature: Number(raw.current.temperature_2m),
      apparentTemperature: Number(raw.current.apparent_temperature),
      humidity: Number(raw.current.relative_humidity_2m),
      precipitation: Number(raw.current.precipitation),
      weatherCode: Number(raw.current.weather_code),
      windSpeed: Number(raw.current.wind_speed_10m),
      windDirection: Number(raw.current.wind_direction_10m),
      isDay: Number(raw.current.is_day) === 1,
      pressure: Number(raw.current.surface_pressure),
      cloudCover: Number(raw.current.cloud_cover),
      visibility: Number(raw.current.visibility),
      uvIndex: Number(raw.current.uv_index),
    },
    hourly: (raw.hourly.time as string[]).map((time, i) => ({
      time,
      temperature: Number(raw.hourly.temperature_2m[i]),
      precipitationProbability: Number(raw.hourly.precipitation_probability[i]),
      weatherCode: Number(raw.hourly.weather_code[i]),
      isDay: Number(raw.hourly.is_day[i]) === 1,
    })),
    daily: (raw.daily.time as string[]).map((date, i) => ({
      date,
      weatherCode: Number(raw.daily.weather_code[i]),
      tempMax: Number(raw.daily.temperature_2m_max[i]),
      tempMin: Number(raw.daily.temperature_2m_min[i]),
      precipitationSum: Number(raw.daily.precipitation_sum[i]),
      precipitationProbabilityMax: Number(raw.daily.precipitation_probability_max[i]),
      windSpeedMax: Number(raw.daily.wind_speed_10m_max[i]),
      sunrise: String(raw.daily.sunrise[i]),
      sunset: String(raw.daily.sunset[i]),
      uvIndexMax: Number(raw.daily.uv_index_max[i]),
    })),
  };
}
