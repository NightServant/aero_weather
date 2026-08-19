import { describe, expect, it } from "vitest";
import { aqiBand, aqiDialFraction, AQI_DIAL_MAX } from "./air-quality-bands";

describe("aqiBand", () => {
  it("names each AirNow category at its lower edge", () => {
    expect(aqiBand(0).label).toBe("Good");
    expect(aqiBand(51).label).toBe("Moderate");
    expect(aqiBand(101).label).toBe("Unhealthy for some");
    expect(aqiBand(151).label).toBe("Unhealthy");
    expect(aqiBand(201).label).toBe("Very unhealthy");
    expect(aqiBand(301).label).toBe("Hazardous");
  });

  it("keeps each category at its upper edge, so boundaries do not skip", () => {
    expect(aqiBand(50).label).toBe("Good");
    expect(aqiBand(100).label).toBe("Moderate");
    expect(aqiBand(150).label).toBe("Unhealthy for some");
    expect(aqiBand(200).label).toBe("Unhealthy");
    expect(aqiBand(300).label).toBe("Very unhealthy");
  });

  it("has no gap between bands: every value 0..400 resolves", () => {
    for (let v = 0; v <= 400; v++) {
      expect(aqiBand(v).label).toBeTruthy();
    }
  });

  it("treats nonsense readings as the safest category rather than throwing", () => {
    expect(aqiBand(Number.NaN).label).toBe("Good");
    expect(aqiBand(-20).label).toBe("Good");
  });

  it("gives every band advice and a colour", () => {
    for (const v of [10, 75, 120, 175, 250, 500]) {
      expect(aqiBand(v).advice.length).toBeGreaterThan(0);
      expect(aqiBand(v).color).toMatch(/^oklch\(/);
    }
  });
});

describe("aqiDialFraction", () => {
  it("is empty at zero and full at the dial ceiling", () => {
    expect(aqiDialFraction(0)).toBe(0);
    expect(aqiDialFraction(AQI_DIAL_MAX)).toBe(1);
  });

  it("pins full beyond the ceiling instead of overflowing the arc", () => {
    expect(aqiDialFraction(AQI_DIAL_MAX * 3)).toBe(1);
  });

  it("never goes negative, and survives a missing reading", () => {
    expect(aqiDialFraction(-50)).toBe(0);
    expect(aqiDialFraction(Number.NaN)).toBe(0);
  });

  it("scales linearly in between", () => {
    expect(aqiDialFraction(150)).toBeCloseTo(0.5, 5);
  });
});
