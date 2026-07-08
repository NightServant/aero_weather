import { describe, it, expect } from "vitest";
import { summarizeLocations } from "./locations-summary";
import type { Forecast } from "./api/types";

function fc(temp: number, weatherCode: number): Forecast {
  return {
    place: { latitude: 0, longitude: 0, timezone: "UTC" },
    current: {
      time: "", temperature: temp, apparentTemperature: temp, humidity: 0,
      precipitation: 0, windSpeed: 0, windDirection: 0, weatherCode,
      isDay: true, pressure: 0, cloudCover: 0, visibility: 0, uvIndex: 0,
    },
    hourly: [],
    daily: [],
  };
}

describe("summarizeLocations", () => {
  it("counts saved places and averages available current temps", () => {
    const byId = { 1: fc(10, 0), 2: fc(20, 0), 3: undefined }; // 3 still loading
    const r = summarizeLocations([1, 2, 3], byId, 1, "celsius");
    expect(r.savedCount).toBe(3);
    expect(r.avgTemp).toBe(15); // (10 + 20) / 2, loaders ignored
  });

  it("counts locations whose current condition is rainy", () => {
    const byId = { 1: fc(10, 61), 2: fc(20, 3), 3: fc(15, 95) }; // rain, cloudy, thunderstorm
    const r = summarizeLocations([1, 2, 3], byId, 1, "celsius");
    expect(r.rainCount).toBe(2);
  });

  it("returns null avgTemp when no forecasts have loaded", () => {
    const r = summarizeLocations([1], { 1: undefined }, 1, "celsius");
    expect(r.avgTemp).toBeNull();
    expect(r.rainCount).toBe(0);
  });
});
