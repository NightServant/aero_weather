import { describe, it, expect } from "vitest";
import { paletteFromWeather } from "./theme";
import type { WeatherKind } from "./api/weather-code";

describe("paletteFromWeather", () => {
  it("always returns night when it is not day, regardless of kind", () => {
    const kinds: WeatherKind[] = ["clear", "cloudy", "rain", "thunderstorm", "snow"];
    for (const k of kinds) expect(paletteFromWeather(k, false)).toBe("night");
  });

  it("maps clear-ish daytime kinds to sunny", () => {
    expect(paletteFromWeather("clear", true)).toBe("sunny");
    expect(paletteFromWeather("mainly-clear", true)).toBe("sunny");
    expect(paletteFromWeather("partly-cloudy", true)).toBe("sunny");
  });

  it("maps cloudy and fog to cloudy", () => {
    expect(paletteFromWeather("cloudy", true)).toBe("cloudy");
    expect(paletteFromWeather("fog", true)).toBe("cloudy");
  });

  it("maps all wet kinds to rainy", () => {
    for (const k of ["drizzle", "rain", "rain-showers", "freezing-rain"] as WeatherKind[]) {
      expect(paletteFromWeather(k, true)).toBe("rainy");
    }
  });

  it("maps thunderstorms to stormy and snow to snowy", () => {
    expect(paletteFromWeather("thunderstorm", true)).toBe("stormy");
    expect(paletteFromWeather("thunderstorm-hail", true)).toBe("stormy");
    expect(paletteFromWeather("snow", true)).toBe("snowy");
    expect(paletteFromWeather("snow-showers", true)).toBe("snowy");
  });
});
