import { describe, it, expect, vi, afterEach } from "vitest";
import { searchPlaces, reverseGeocode } from "./geocoding";

function mockFetch(body: unknown) {
  const fn = vi.fn(async () => ({ ok: true, status: 200, json: async () => body, text: async () => "" }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("searchPlaces", () => {
  it("short-circuits for queries under two characters without fetching", async () => {
    const fetchFn = mockFetch({ results: [] });
    expect(await searchPlaces("a")).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("maps the raw open-meteo shape to Place (country_code -> countryCode)", async () => {
    mockFetch({
      results: [
        {
          id: 2950159,
          name: "Berlin",
          admin1: "Land Berlin",
          country: "Germany",
          country_code: "DE",
          latitude: 52.52,
          longitude: 13.41,
          timezone: "Europe/Berlin",
          population: 3426354,
        },
      ],
    });
    const [p] = await searchPlaces("Berlin");
    expect(p).toMatchObject({
      id: 2950159,
      name: "Berlin",
      countryCode: "DE",
      latitude: 52.52,
      longitude: 13.41,
    });
  });

  it("returns an empty array when the API omits results", async () => {
    mockFetch({});
    expect(await searchPlaces("Nowhereville")).toEqual([]);
  });
});

describe("reverseGeocode", () => {
  it("builds a Place from a reverse-geocode payload", async () => {
    mockFetch({
      city: "Berlin",
      principalSubdivision: "Land Berlin",
      countryName: "Germany",
      countryCode: "DE",
    });
    const p = await reverseGeocode(52.52, 13.41);
    expect(p).toMatchObject({
      name: "Berlin",
      admin1: "Land Berlin",
      country: "Germany",
      countryCode: "DE",
      latitude: 52.52,
      longitude: 13.41,
    });
    expect(typeof p?.id).toBe("number");
  });

  it("falls back to locality when city is missing", async () => {
    mockFetch({ locality: "Kreuzberg", countryName: "Germany" });
    expect((await reverseGeocode(52.5, 13.4))?.name).toBe("Kreuzberg");
  });

  it("returns null when neither city nor locality is present", async () => {
    mockFetch({ countryName: "Germany" });
    expect(await reverseGeocode(0, 0)).toBeNull();
  });

  it("derives a stable id from coordinates (same input -> same id)", async () => {
    mockFetch({ city: "Berlin", countryName: "Germany", countryCode: "DE" });
    const a = await reverseGeocode(52.52, 13.41);
    mockFetch({ city: "Berlin", countryName: "Germany", countryCode: "DE" });
    const b = await reverseGeocode(52.52, 13.41);
    expect(a?.id).toBe(b?.id);
  });
});
