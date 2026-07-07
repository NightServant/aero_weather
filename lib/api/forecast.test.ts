import { describe, it, expect, vi, afterEach } from "vitest";
import { getForecast } from "./forecast";
import type { UnitPrefs } from "./types";

const UNITS: UnitPrefs = { temperature: "celsius", wind: "kmh", precipitation: "mm" };

type FetchLike = (url: string, init?: RequestInit) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}>;

function stubForecast(raw: unknown) {
  const fn = vi.fn<FetchLike>(async () => ({
    ok: true,
    status: 200,
    text: async () => "",
    json: async () => raw,
  }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

const RAW = {
  latitude: 52.52,
  longitude: 13.41,
  timezone: "Europe/Berlin",
  current: {
    time: "2026-01-01T12:00",
    temperature_2m: 19.4,
    apparent_temperature: 18,
    relative_humidity_2m: 60,
    dew_point_2m: 9,
    precipitation: 0,
    weather_code: 3,
    wind_speed_10m: 14,
    wind_direction_10m: 225,
    is_day: 1,
    surface_pressure: 1013,
    cloud_cover: 75,
    visibility: 24000,
    uv_index: 2,
  },
  hourly: {
    time: ["2026-01-01T12:00", "2026-01-01T13:00"],
    temperature_2m: [19, 20],
    dew_point_2m: [9, null], // null beyond model horizon
    precipitation_probability: [10, 20],
    weather_code: [3, 61],
    is_day: [1, 0],
  },
  daily: {
    time: ["2026-01-01"],
    weather_code: [3],
    temperature_2m_max: [21],
    temperature_2m_min: [12],
    precipitation_sum: [0],
    precipitation_probability_max: [30],
    wind_speed_10m_max: [28],
    sunrise: ["2026-01-01T07:00"],
    sunset: ["2026-01-01T17:00"],
    uv_index_max: [3],
  },
};

afterEach(() => vi.unstubAllGlobals());

describe("getForecast", () => {
  it("maps the raw payload into the typed Forecast shape", async () => {
    stubForecast(RAW);
    const f = await getForecast(52.52, 13.41, UNITS);
    expect(f.place).toEqual({ latitude: 52.52, longitude: 13.41, timezone: "Europe/Berlin" });
    expect(f.current.temperature).toBe(19.4);
    expect(f.current.isDay).toBe(true); // is_day 1 -> true
    expect(f.hourly).toHaveLength(2);
    expect(f.hourly[1].isDay).toBe(false); // is_day 0 -> false
    expect(f.daily[0]).toMatchObject({ tempMax: 21, tempMin: 12, windSpeedMax: 28 });
  });

  it("keeps null optional fields as undefined instead of coercing to 0", async () => {
    stubForecast(RAW);
    const f = await getForecast(52.52, 13.41, UNITS);
    expect(f.current.dewPoint).toBe(9);
    expect(f.hourly[0].dewPoint).toBe(9);
    expect(f.hourly[1].dewPoint).toBeUndefined(); // null -> undefined, NOT 0
  });

  it("forwards unit preferences to the request query", async () => {
    const fetchFn = stubForecast(RAW);
    await getForecast(52.52, 13.41, { temperature: "fahrenheit", wind: "mph", precipitation: "inch" });
    const url = new URL(fetchFn.mock.calls[0]![0]);
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(url.searchParams.get("wind_speed_unit")).toBe("mph");
    expect(url.searchParams.get("precipitation_unit")).toBe("inch");
  });
});
