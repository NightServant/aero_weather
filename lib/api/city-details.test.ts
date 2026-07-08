// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCityDescription, getCityGallery } from "./city-details";
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

describe("getCityDescription", () => {
  it("returns the summary extract and caches it (one fetch for repeats)", async () => {
    const fetchFn = stubFetch(() => ({ ok: true, body: { extract: "A test city." } }));
    const p = place({ id: 201, name: "Zzytown" });
    expect(await getCityDescription(p)).toBe("A test city.");
    expect(await getCityDescription(p)).toBe("A test city."); // cached
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("treats disambiguation pages as no description", async () => {
    stubFetch(() => ({ ok: true, body: { type: "disambiguation", extract: "x" } }));
    expect(await getCityDescription(place({ id: 202, name: "Springfield" }))).toBeNull();
  });

  it("resolves to null on failure", async () => {
    stubFetch(() => ({ ok: false }));
    expect(await getCityDescription(place({ id: 203, name: "Nowhere" }))).toBeNull();
  });
});

describe("getCityGallery", () => {
  it("returns https-normalized image sources, skips non-images, caps the count", async () => {
    const items = [
      { type: "image", srcset: [{ src: "//upload.wikimedia.org/a.jpg", scale: "1x" }] },
      { type: "video", srcset: [{ src: "//upload.wikimedia.org/clip.webm", scale: "1x" }] },
      { type: "image", srcset: [{ src: "//upload.wikimedia.org/b.jpg", scale: "1x" }] },
    ];
    stubFetch(() => ({ ok: true, body: { items } }));
    const urls = await getCityGallery(place({ id: 204, name: "Galleryville" }));
    expect(urls).toEqual(["https://upload.wikimedia.org/a.jpg", "https://upload.wikimedia.org/b.jpg"]);
  });

  it("resolves to an empty array on failure", async () => {
    stubFetch(() => ({ ok: false }));
    expect(await getCityGallery(place({ id: 205, name: "Nowhere" }))).toEqual([]);
  });
});
