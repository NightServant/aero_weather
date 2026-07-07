import { describe, it, expect } from "vitest";
import { weatherCodeToKind, WEATHER_LABEL, type WeatherKind } from "./weather-code";

describe("weatherCodeToKind", () => {
  it("maps the exact-code conditions", () => {
    expect(weatherCodeToKind(0)).toBe("clear");
    expect(weatherCodeToKind(1)).toBe("mainly-clear");
    expect(weatherCodeToKind(2)).toBe("partly-cloudy");
    expect(weatherCodeToKind(3)).toBe("cloudy");
    expect(weatherCodeToKind(95)).toBe("thunderstorm");
  });

  it("maps fog codes 45 and 48", () => {
    expect(weatherCodeToKind(45)).toBe("fog");
    expect(weatherCodeToKind(48)).toBe("fog");
  });

  it("handles the drizzle range 51-57", () => {
    for (const c of [51, 53, 55, 56, 57]) expect(weatherCodeToKind(c)).toBe("drizzle");
  });

  it("prioritizes freezing-rain (66/67) over the rain range", () => {
    expect(weatherCodeToKind(66)).toBe("freezing-rain");
    expect(weatherCodeToKind(67)).toBe("freezing-rain");
    // 61-65 stay rain
    expect(weatherCodeToKind(61)).toBe("rain");
    expect(weatherCodeToKind(65)).toBe("rain");
  });

  it("maps snow (71-77) and snow showers (85/86)", () => {
    expect(weatherCodeToKind(71)).toBe("snow");
    expect(weatherCodeToKind(77)).toBe("snow");
    expect(weatherCodeToKind(85)).toBe("snow-showers");
    expect(weatherCodeToKind(86)).toBe("snow-showers");
  });

  it("maps rain showers (80-82) and thunderstorm-hail (96/99)", () => {
    expect(weatherCodeToKind(80)).toBe("rain-showers");
    expect(weatherCodeToKind(82)).toBe("rain-showers");
    expect(weatherCodeToKind(96)).toBe("thunderstorm-hail");
    expect(weatherCodeToKind(99)).toBe("thunderstorm-hail");
  });

  it("falls back to cloudy for unknown codes", () => {
    expect(weatherCodeToKind(-1)).toBe("cloudy");
    expect(weatherCodeToKind(4)).toBe("cloudy"); // gap between defined codes
    expect(weatherCodeToKind(1000)).toBe("cloudy");
  });
});

describe("WEATHER_LABEL", () => {
  it("has a non-empty label for every WeatherKind returned by the mapper", () => {
    const kinds: WeatherKind[] = [
      "clear", "mainly-clear", "partly-cloudy", "cloudy", "fog", "drizzle", "rain",
      "freezing-rain", "snow", "snow-showers", "rain-showers", "thunderstorm", "thunderstorm-hail",
    ];
    for (const k of kinds) {
      expect(WEATHER_LABEL[k]).toBeTruthy();
      expect(typeof WEATHER_LABEL[k]).toBe("string");
    }
  });
});
