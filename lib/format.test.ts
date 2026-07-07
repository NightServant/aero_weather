import { describe, it, expect } from "vitest";
import {
  formatTemp,
  tempUnitLabel,
  formatWind,
  windUnitLabel,
  windDirectionLabel,
  compassToWord,
  formatMinutes,
  durationBetween,
  dewPoint,
  resolveDewPoint,
  findNowIndex,
  relativeGreeting,
  formatTime,
  formatHour,
  formatDate,
  formatShortDate,
  formatWeekdayShort,
} from "./format";

describe("formatTemp / unit labels", () => {
  it("rounds and appends a degree symbol by default", () => {
    expect(formatTemp(19.4, "celsius")).toBe("19°");
    expect(formatTemp(19.6, "celsius")).toBe("20°");
    expect(formatTemp(-0.4, "celsius")).toBe("0°"); // -0 rounds to "0"
  });

  it("omits the degree symbol when withDegree=false", () => {
    expect(formatTemp(19.4, "fahrenheit", false)).toBe("19");
  });

  it("labels temperature units", () => {
    expect(tempUnitLabel("fahrenheit")).toBe("F");
    expect(tempUnitLabel("celsius")).toBe("C");
  });

  it("formats and labels wind units", () => {
    expect(formatWind(14.6)).toBe("15");
    expect(windUnitLabel("kmh")).toBe("km/h");
    expect(windUnitLabel("mph")).toBe("mph");
    expect(windUnitLabel("ms")).toBe("m/s");
  });
});

describe("wind direction", () => {
  it("maps degrees to 8-point compass labels", () => {
    expect(windDirectionLabel(0)).toBe("N");
    expect(windDirectionLabel(45)).toBe("NE");
    expect(windDirectionLabel(90)).toBe("E");
    expect(windDirectionLabel(180)).toBe("S");
    expect(windDirectionLabel(270)).toBe("W");
    expect(windDirectionLabel(360)).toBe("N"); // wraps
  });

  it("converts degrees to a lowercase word", () => {
    expect(compassToWord(0)).toBe("north");
    expect(compassToWord(135)).toBe("southeast");
    expect(compassToWord(315)).toBe("northwest");
  });
});

describe("duration formatting", () => {
  it("formats minutes as Xh Ym and clamps negatives to zero", () => {
    expect(formatMinutes(90)).toBe("1h 30m");
    expect(formatMinutes(0)).toBe("0h 0m");
    expect(formatMinutes(-15)).toBe("0h 0m");
    expect(formatMinutes(605)).toBe("10h 5m");
  });

  it("computes the duration between two ISO timestamps", () => {
    expect(durationBetween("2026-01-01T06:00:00Z", "2026-01-01T07:30:00Z")).toBe("1h 30m");
  });
});

describe("dew point", () => {
  it("approximates dew point from temperature and humidity (Magnus)", () => {
    expect(dewPoint(20, 50)).toBeCloseTo(9.25, 1);
  });

  it("resolveDewPoint prefers the API value when finite", () => {
    expect(resolveDewPoint({ dewPoint: 5, temperature: 20, humidity: 50 }, "celsius")).toBe(5);
  });

  it("resolveDewPoint derives from temp/humidity when the API value is absent", () => {
    const c = resolveDewPoint({ temperature: 20, humidity: 50 }, "celsius");
    expect(c).toBeCloseTo(9.25, 1);
  });

  it("resolveDewPoint round-trips fahrenheit through celsius", () => {
    // 68F == 20C, so the derived dew point should equal the celsius case reconverted to F.
    const f = resolveDewPoint({ temperature: 68, humidity: 50 }, "fahrenheit");
    expect(f).toBeCloseTo((9.25 * 9) / 5 + 32, 0);
  });

  it("resolveDewPoint returns null for impossible humidity", () => {
    expect(resolveDewPoint({ temperature: 20, humidity: 0 }, "celsius")).toBeNull();
  });
});

describe("findNowIndex", () => {
  it("returns the first point at or after now", () => {
    const past = new Date(Date.now() - 3_600_000).toISOString();
    const future = new Date(Date.now() + 3_600_000).toISOString();
    expect(findNowIndex([{ time: past }, { time: future }])).toBe(1);
  });

  it("returns 0 when every point is in the past", () => {
    const past1 = new Date(Date.now() - 7_200_000).toISOString();
    const past2 = new Date(Date.now() - 3_600_000).toISOString();
    expect(findNowIndex([{ time: past1 }, { time: past2 }])).toBe(0);
  });
});

describe("relativeGreeting", () => {
  const at = (hourUtc: number) =>
    relativeGreeting(new Date(`2026-01-01T${String(hourUtc).padStart(2, "0")}:00:00Z`), "UTC");

  it("greets by time of day", () => {
    expect(at(3)).toBe("Good night");
    expect(at(8)).toBe("Good morning");
    expect(at(14)).toBe("Good afternoon");
    expect(at(19)).toBe("Good evening");
    expect(at(23)).toBe("Good night");
  });
});

describe("Intl date/time formatters (fixed UTC)", () => {
  const iso = "2026-01-01T09:05:00Z"; // 2026-01-01 is a Thursday

  it("formats time with and without a 12-hour clock", () => {
    expect(formatTime(iso, true, "UTC")).toBe("9:05 AM");
    expect(formatTime(iso, false, "UTC")).toMatch(/^0?9:05$/);
  });

  it("formats the hour only", () => {
    expect(formatHour(iso, true, "UTC")).toBe("9 AM");
  });

  it("formats long and short dates and the short weekday", () => {
    expect(formatDate(iso, "UTC")).toBe("Thursday, January 1");
    expect(formatShortDate(iso, "UTC")).toBe("Jan 1");
    expect(formatWeekdayShort(iso, "UTC")).toBe("Thu");
  });

  it("respects the timezone argument (rolls to the previous day in Los Angeles)", () => {
    // 09:05 UTC on Jan 1 is 01:05 on Jan 1 in LA (UTC-8) — still Thursday.
    // 04:00 UTC on Jan 1 is 20:00 on Dec 31 in LA — Wednesday.
    expect(formatWeekdayShort("2026-01-01T04:00:00Z", "America/Los_Angeles")).toBe("Wed");
  });
});
