// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCityImage } from "./city-image";
import type { Place } from "./types";

const place = (over: Partial<Place>): Place => ({
  id: 1,
  name: "Testville",
  country: "Testland",
  countryCode: "TL",
  latitude: 0,
  longitude: 0,
  timezone: "UTC",
  ...over,
});

function stubFetch(handler: (url: string) => { ok: boolean; body?: unknown }) {
  const fn = vi.fn(async (url: string) => {
    const { ok, body } = handler(url);
    return { ok, status: ok ? 200 : 404, json: async () => body, text: async () => "" };
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe("getCityImage — seeded photos", () => {
  it("returns a bundled photo without any network call", async () => {
    const fetchFn = stubFetch(() => ({ ok: true, body: {} }));
    expect(await getCityImage(place({ name: "Bamban" }))).toBe("/cities/bamban.webp");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("normalizes the name (case/whitespace) before matching a seed", async () => {
    stubFetch(() => ({ ok: true, body: {} }));
    expect(await getCityImage(place({ name: "Baguio City" }))).toBe("/cities/baguio.webp");
  });
});

describe("getCityImage — Wikipedia lookup", () => {
  it("returns the thumbnail source and caches it (one fetch for repeat calls)", async () => {
    const fetchFn = stubFetch(() => ({ ok: true, body: { thumbnail: { source: "https://img/thumb.jpg" } } }));
    const p = place({ id: 101, name: "Zzytown" });
    expect(await getCityImage(p)).toBe("https://img/thumb.jpg");
    expect(await getCityImage(p)).toBe("https://img/thumb.jpg"); // served from cache
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("treats disambiguation pages as no image", async () => {
    stubFetch(() => ({ ok: true, body: { type: "disambiguation", thumbnail: { source: "x" } } }));
    expect(await getCityImage(place({ id: 102, name: "Springfield" }))).toBeNull();
  });

  it("falls back through candidate titles until one has an image", async () => {
    const fetchFn = stubFetch((url) =>
      url.includes("%2C") // the "Name, admin1"/"Name, country" variants are encoded with %2C
        ? { ok: true, body: { originalimage: { source: "https://img/original.jpg" } } }
        : { ok: false },
    );
    const p = place({ id: 103, name: "Obscureville", admin1: "Region", country: "Nation" });
    expect(await getCityImage(p)).toBe("https://img/original.jpg");
    expect(fetchFn.mock.calls.length).toBeGreaterThan(1); // first bare-name title missed
  });

  it("resolves to null when every lookup fails", async () => {
    stubFetch(() => ({ ok: false }));
    expect(await getCityImage(place({ id: 104, name: "Nowhere" }))).toBeNull();
  });
});

describe("getCityImage — country places", () => {
  it("returns null (gradient fallback) instead of fetching a country's flag", async () => {
    const fetchFn = stubFetch(() => ({ ok: true, body: { thumbnail: { source: "https://img/flag.svg" } } }));
    const p = place({ id: 682, name: "Saudi Arabia", country: "Saudi Arabia" });
    expect(await getCityImage(p)).toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("still fetches for a city that shares no name with its country", async () => {
    const fetchFn = stubFetch(() => ({ ok: true, body: { thumbnail: { source: "https://img/city.jpg" } } }));
    const p = place({ id: 683, name: "Riyadh", admin1: "Riyadh Province", country: "Saudi Arabia" });
    expect(await getCityImage(p)).toBe("https://img/city.jpg");
    expect(fetchFn).toHaveBeenCalled();
  });
});
