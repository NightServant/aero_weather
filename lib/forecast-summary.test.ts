import { describe, it, expect } from "vitest";
import { summarizeToday, summarizeWeek } from "./forecast-summary";
import type { Forecast, CurrentConditions, DailyPoint, HourlyPoint } from "./api/types";

const current = (weatherCode: number): CurrentConditions => ({
  time: "2026-01-01T12:00:00Z",
  temperature: 10,
  apparentTemperature: 9,
  humidity: 60,
  precipitation: 0,
  windSpeed: 10,
  windDirection: 180,
  weatherCode,
  isDay: true,
  pressure: 1013,
  cloudCover: 50,
  visibility: 10000,
  uvIndex: 3,
});

const hour = (precipitationProbability: number): HourlyPoint => ({
  time: "2026-01-01T12:00:00Z",
  temperature: 10,
  precipitationProbability,
  weatherCode: 0,
  isDay: true,
});

const day = (weatherCode: number, precipitationProbabilityMax = 0): DailyPoint => ({
  date: "2026-01-01",
  weatherCode,
  tempMax: 12,
  tempMin: 4,
  precipitationSum: 0,
  precipitationProbabilityMax,
  windSpeedMax: 20,
  sunrise: "2026-01-01T07:00:00Z",
  sunset: "2026-01-01T17:00:00Z",
  uvIndexMax: 3,
});

const forecast = (over: Partial<Forecast>): Forecast => ({
  place: { latitude: 0, longitude: 0, timezone: "UTC" },
  current: current(3),
  hourly: Array.from({ length: 12 }, () => hour(0)),
  daily: Array.from({ length: 7 }, () => day(3, 0)),
  ...over,
});

describe("summarizeToday", () => {
  it("warns on thunderstorms", () => {
    expect(summarizeToday(forecast({ current: current(95) }))).toMatch(/Severe weather/i);
  });

  it("recommends waterproofs for rain/drizzle", () => {
    expect(summarizeToday(forecast({ current: current(61) }))).toMatch(/waterproof/i);
    expect(summarizeToday(forecast({ current: current(51) }))).toMatch(/waterproof/i);
  });

  it("mentions slower travel for snow", () => {
    expect(summarizeToday(forecast({ current: current(71) }))).toMatch(/snow/i);
  });

  it("differentiates clear days by upcoming precip chance", () => {
    const settled = forecast({ current: current(0), hourly: Array.from({ length: 12 }, () => hour(0)) });
    expect(summarizeToday(settled)).toMatch(/bright, settled/i);

    const showersLater = forecast({
      current: current(0),
      hourly: [hour(0), hour(45), ...Array.from({ length: 10 }, () => hour(0))],
    });
    expect(summarizeToday(showersLater)).toMatch(/before evening showers/i);
  });

  it("handles partly-cloudy, fog, and the mixed fallback", () => {
    expect(summarizeToday(forecast({ current: current(2) }))).toMatch(/Sun and cloud/i);
    expect(summarizeToday(forecast({ current: current(45) }))).toMatch(/Fog/i);
    expect(summarizeToday(forecast({ current: current(3) }))).toMatch(/mixed day/i);
  });

  it("only considers the next 12 hourly points for precip chance", () => {
    // A high-precip point at index 20 must NOT trigger the "showers" branch.
    const hourly = [
      ...Array.from({ length: 12 }, () => hour(0)),
      ...Array.from({ length: 12 }, () => hour(90)),
    ];
    expect(summarizeToday(forecast({ current: current(0), hourly }))).toMatch(/bright, settled/i);
  });
});

describe("summarizeWeek", () => {
  it("prioritizes a storm system when any day is a thunderstorm", () => {
    const daily = [day(95, 80), ...Array.from({ length: 6 }, () => day(0, 70))];
    expect(summarizeWeek(forecast({ daily })).title).toBe("Storm system on the way");
  });

  it("calls out a wet stretch when 3+ wet days and no storms", () => {
    const daily = [day(3, 60), day(3, 70), day(3, 80), ...Array.from({ length: 4 }, () => day(3, 10))];
    expect(summarizeWeek(forecast({ daily })).title).toBe("A wet stretch midweek");
  });

  it("celebrates a bright week with 5+ clear days and no wet days", () => {
    const daily = [...Array.from({ length: 5 }, () => day(0, 0)), day(3, 0), day(2, 0)];
    expect(summarizeWeek(forecast({ daily })).title).toBe("Bright skies all week");
  });

  it("reports a settled week when there is no precipitation at all", () => {
    const daily = Array.from({ length: 7 }, () => day(3, 0)); // cloudy, dry
    expect(summarizeWeek(forecast({ daily })).title).toBe("Settled week ahead");
  });

  it("falls back to a mixed week for a few wet days", () => {
    const daily = [day(3, 65), ...Array.from({ length: 6 }, () => day(3, 10))];
    expect(summarizeWeek(forecast({ daily })).title).toBe("Mixed week ahead");
  });
});
