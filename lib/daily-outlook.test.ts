import { describe, expect, it } from "vitest";
import { dayLabel, showsPrecip, PRECIP_VISIBLE_AT } from "./daily-outlook";

describe("dayLabel", () => {
  it("names the first row Today rather than its weekday", () => {
    expect(dayLabel(0, "2026-08-19T00:00", "America/New_York")).toBe("Today");
  });

  it("uses the short weekday for every later row", () => {
    expect(dayLabel(1, "2026-08-20T00:00", "America/New_York")).toBe("Thu");
    expect(dayLabel(6, "2026-08-25T00:00", "America/New_York")).toBe("Tue");
  });

  it("reads the weekday from the wall-clock date, not the viewer's zone", () => {
    // Late-evening wall clock must not roll into the next weekday.
    expect(dayLabel(1, "2026-08-19T23:30", "America/New_York")).toBe("Wed");
  });
});

describe("showsPrecip", () => {
  it("hides low, actionless probabilities", () => {
    expect(showsPrecip(0)).toBe(false);
    expect(showsPrecip(PRECIP_VISIBLE_AT - 1)).toBe(false);
  });

  it("shows probabilities at or above the threshold", () => {
    expect(showsPrecip(PRECIP_VISIBLE_AT)).toBe(true);
    expect(showsPrecip(90)).toBe(true);
  });

  it("treats missing or non-numeric values as nothing to show", () => {
    expect(showsPrecip(null)).toBe(false);
    expect(showsPrecip(undefined)).toBe(false);
    expect(showsPrecip(Number.NaN)).toBe(false);
  });
});
