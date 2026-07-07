import { describe, it, expect } from "vitest";
import { deriveAlerts } from "./alerts";
import type { Forecast, DailyPoint, HourlyPoint } from "./types";

const hour = (weatherCode: number, time = "2026-01-01T12:00:00Z"): HourlyPoint => ({
  time,
  temperature: 10,
  precipitationProbability: 0,
  weatherCode,
  isDay: true,
});

const day = (over: Partial<DailyPoint> = {}): DailyPoint => ({
  date: "2026-01-01",
  weatherCode: 3,
  tempMax: 12,
  tempMin: 4,
  precipitationSum: 0,
  precipitationProbabilityMax: 0,
  windSpeedMax: 10,
  sunrise: "2026-01-01T07:00:00Z",
  sunset: "2026-01-01T17:00:00Z",
  uvIndexMax: 3,
  ...over,
});

const forecast = (over: Partial<Forecast>): Forecast => ({
  place: { latitude: 0, longitude: 0, timezone: "UTC" },
  current: {
    time: "2026-01-01T12:00:00Z", temperature: 10, apparentTemperature: 9, humidity: 60,
    precipitation: 0, windSpeed: 10, windDirection: 180, weatherCode: 3, isDay: true,
    pressure: 1013, cloudCover: 50, visibility: 10000, uvIndex: 3,
  },
  hourly: [hour(3)],
  daily: [day()],
  ...over,
});

describe("deriveAlerts", () => {
  it("returns no alerts for calm conditions", () => {
    expect(deriveAlerts(forecast({}))).toEqual([]);
  });

  it("emits a thunderstorm watch spanning the first and last storm hour", () => {
    const hourly = [
      hour(3, "2026-01-01T10:00:00Z"),
      hour(95, "2026-01-01T13:00:00Z"),
      hour(96, "2026-01-01T15:00:00Z"),
    ];
    const [alert] = deriveAlerts(forecast({ hourly }));
    expect(alert.severity).toBe("watch");
    expect(alert.startIso).toBe("2026-01-01T13:00:00Z");
    expect(alert.endIso).toBe("2026-01-01T15:00:00Z");
    expect(alert.id).toContain("thunderstorm-");
  });

  it("emits a wind advisory when a day exceeds the gust threshold", () => {
    const alerts = deriveAlerts(forecast({ daily: [day({ windSpeedMax: 60 })] }));
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe("advisory");
    expect(alerts[0].summary).toMatch(/60 km\/h/);
  });

  it("emits a heavy rain advisory when daily precipitation is high", () => {
    const alerts = deriveAlerts(forecast({ daily: [day({ precipitationSum: 18 })] }));
    expect(alerts).toHaveLength(1);
    expect(alerts[0].id).toContain("rain-");
    expect(alerts[0].summary).toMatch(/18 mm/);
  });

  it("prioritizes the storm watch and suppresses wind/rain advisories", () => {
    const alerts = deriveAlerts(
      forecast({
        hourly: [hour(95, "2026-01-01T13:00:00Z")],
        daily: [day({ windSpeedMax: 80, precipitationSum: 30 })],
      }),
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe("watch");
  });
});
