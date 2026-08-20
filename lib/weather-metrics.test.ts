import { describe, expect, it } from "vitest";
import {
  cloudCoverNote,
  feelsLikeNote,
  formatVisibility,
  visibilityNote,
} from "./weather-metrics";

describe("formatVisibility", () => {
  it("reports sub-kilometre readings in metres, rounded to 100", () => {
    expect(formatVisibility(850)).toBe("900 m");
    expect(formatVisibility(120)).toBe("100 m");
  });

  it("keeps one decimal below 10km, where haze still reads in the number", () => {
    expect(formatVisibility(2400)).toBe("2.4 km");
    expect(formatVisibility(9400)).toBe("9.4 km");
  });

  it("rounds to whole kilometres at 10km and beyond", () => {
    expect(formatVisibility(10000)).toBe("10 km");
    expect(formatVisibility(24140)).toBe("24 km");
  });

  it("returns a placeholder rather than NaN for a missing reading", () => {
    expect(formatVisibility(Number.NaN)).toBe("--");
    expect(formatVisibility(-5)).toBe("--");
  });
});

describe("visibilityNote", () => {
  it("escalates from clear to fog as the reading drops", () => {
    expect(visibilityNote(20000)).toBe("Clear line of sight");
    expect(visibilityNote(8000)).toBe("Slightly hazy");
    expect(visibilityNote(2000)).toBe("Hazy");
    expect(visibilityNote(400)).toBe("Fog, take care driving");
  });

  it("has no gap between bands", () => {
    for (let m = 0; m <= 20000; m += 250) {
      expect(visibilityNote(m).length).toBeGreaterThan(0);
    }
  });
});

describe("feelsLikeNote", () => {
  it("names the direction and size of the departure", () => {
    expect(feelsLikeNote(24, 20)).toBe("4° warmer than actual");
    expect(feelsLikeNote(16, 20)).toBe("4° cooler than actual");
  });

  it("says so plainly when the two agree", () => {
    expect(feelsLikeNote(20, 20)).toBe("Matches the actual reading");
    // Rounding first avoids "0° warmer" from a fractional difference.
    expect(feelsLikeNote(20.4, 20.1)).toBe("Matches the actual reading");
  });

  it("survives a missing reading", () => {
    expect(feelsLikeNote(Number.NaN, 20)).toBe("No reading");
  });
});

describe("cloudCoverNote", () => {
  it("covers the okta range end to end", () => {
    expect(cloudCoverNote(0)).toBe("Clear sky");
    expect(cloudCoverNote(25)).toBe("Mostly clear");
    expect(cloudCoverNote(50)).toBe("Partly cloudy");
    expect(cloudCoverNote(75)).toBe("Mostly cloudy");
    expect(cloudCoverNote(100)).toBe("Overcast");
  });

  it("resolves every percentage without a gap", () => {
    for (let p = 0; p <= 100; p++) expect(cloudCoverNote(p).length).toBeGreaterThan(0);
  });
});
