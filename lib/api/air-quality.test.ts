import { describe, it, expect, vi, afterEach } from "vitest";
import { getAirQuality, aqiCategory } from "./air-quality";

afterEach(() => vi.unstubAllGlobals());

describe("aqiCategory", () => {
  it("classifies AQI values at each EPA boundary", () => {
    expect(aqiCategory(0)).toBe("good");
    expect(aqiCategory(50)).toBe("good");
    expect(aqiCategory(51)).toBe("moderate");
    expect(aqiCategory(100)).toBe("moderate");
    expect(aqiCategory(150)).toBe("unhealthy-sg");
    expect(aqiCategory(200)).toBe("unhealthy");
    expect(aqiCategory(300)).toBe("very-unhealthy");
    expect(aqiCategory(301)).toBe("hazardous");
    expect(aqiCategory(999)).toBe("hazardous");
  });
});

describe("getAirQuality", () => {
  it("maps the raw current block to the AirQuality shape (nitrogen_dioxide -> no2)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => "",
        json: async () => ({
          current: { time: "2026-01-01T12:00", us_aqi: 42, pm2_5: 8, pm10: 12, ozone: 60, nitrogen_dioxide: 15 },
        }),
      })),
    );
    const aq = await getAirQuality(52.52, 13.41);
    expect(aq).toEqual({ time: "2026-01-01T12:00", usAqi: 42, pm2_5: 8, pm10: 12, ozone: 60, no2: 15 });
  });
});
