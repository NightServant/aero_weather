import { describe, it, expect } from "vitest";
import { SUGGESTED_LOCATIONS, getSuggestedLocations } from "./suggested-locations";
import type { Place } from "./api/types";

describe("getSuggestedLocations", () => {
  it("returns the full curated list when nothing is saved", () => {
    expect(getSuggestedLocations([]).length).toBe(SUGGESTED_LOCATIONS.length);
  });

  it("excludes places already saved (matched by proximity via findSamePlace)", () => {
    const first = SUGGESTED_LOCATIONS[0];
    const saved: Place[] = [{ ...first }];
    const result = getSuggestedLocations(saved);
    expect(result.some((p) => p.name === first.name)).toBe(false);
    expect(result.length).toBe(SUGGESTED_LOCATIONS.length - 1);
  });

  it("every curated entry has the fields a card needs", () => {
    for (const p of SUGGESTED_LOCATIONS) {
      expect(typeof p.id).toBe("number");
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.country.length).toBeGreaterThan(0);
      expect(Number.isFinite(p.latitude)).toBe(true);
      expect(Number.isFinite(p.longitude)).toBe(true);
    }
  });
});
