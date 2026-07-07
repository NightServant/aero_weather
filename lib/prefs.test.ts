// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  activeLocation,
  findSamePlace,
  addPlace,
  loadPrefs,
  savePrefs,
  subscribePrefs,
  DEFAULT_PREFS,
  type Prefs,
} from "./prefs";
import type { Place } from "./api/types";

const place = (over: Partial<Place> = {}): Place => ({
  id: 1,
  name: "Berlin",
  country: "Germany",
  countryCode: "DE",
  latitude: 52.52,
  longitude: 13.41,
  timezone: "Europe/Berlin",
  ...over,
});

const prefsWith = (over: Partial<Prefs>): Prefs => ({ ...DEFAULT_PREFS, ...over });

describe("findSamePlace", () => {
  it("matches by id even when coordinates differ", () => {
    const list = [place({ id: 7, latitude: 0, longitude: 0 })];
    expect(findSamePlace(list, place({ id: 7, latitude: 50, longitude: 50 }))?.id).toBe(7);
  });

  it("matches by proximity (~2km tolerance) when ids differ", () => {
    const list = [place({ id: 1, latitude: 52.52, longitude: 13.41 })];
    const near = place({ id: 999, latitude: 52.53, longitude: 13.42 }); // < 0.02 deg away
    expect(findSamePlace(list, near)?.id).toBe(1);
  });

  it("returns undefined when nothing is close", () => {
    const list = [place({ id: 1, latitude: 52.52, longitude: 13.41 })];
    expect(findSamePlace(list, place({ id: 2, latitude: 40.71, longitude: -74.0 }))).toBeUndefined();
  });
});

describe("addPlace", () => {
  it("appends a new place and returns its id", () => {
    const { list, id } = addPlace([], place({ id: 5 }));
    expect(list).toHaveLength(1);
    expect(id).toBe(5);
  });

  it("does not duplicate a near-existing place and returns the canonical id", () => {
    const existing = place({ id: 1, latitude: 52.52, longitude: 13.41 });
    const dup = place({ id: 888, latitude: 52.525, longitude: 13.415 });
    const { list, id } = addPlace([existing], dup);
    expect(list).toHaveLength(1);
    expect(id).toBe(1); // canonical existing id, not the incoming one
  });
});

describe("activeLocation", () => {
  it("returns null when there are no saved locations", () => {
    expect(activeLocation(DEFAULT_PREFS)).toBeNull();
  });

  it("returns the first location when no active id is set", () => {
    const p = prefsWith({ locations: [place({ id: 1 }), place({ id: 2, name: "Paris" })] });
    expect(activeLocation(p)?.id).toBe(1);
  });

  it("returns the matching location for the active id", () => {
    const p = prefsWith({
      locations: [place({ id: 1 }), place({ id: 2, name: "Paris" })],
      activeLocationId: 2,
    });
    expect(activeLocation(p)?.name).toBe("Paris");
  });

  it("falls back to the first location when the active id is stale", () => {
    const p = prefsWith({ locations: [place({ id: 1 })], activeLocationId: 404 });
    expect(activeLocation(p)?.id).toBe(1);
  });
});

describe("loadPrefs / savePrefs (localStorage)", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns defaults when nothing is stored", () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("round-trips saved prefs and deep-merges partial units/notifications", () => {
    window.localStorage.setItem(
      "aero.prefs.v1",
      JSON.stringify({ units: { temperature: "fahrenheit" }, timeFormat: "24h" }),
    );
    const loaded = loadPrefs();
    expect(loaded.units.temperature).toBe("fahrenheit");
    expect(loaded.units.wind).toBe("kmh"); // filled from defaults
    expect(loaded.timeFormat).toBe("24h");
  });

  it("dedupes stored locations on load", () => {
    window.localStorage.setItem(
      "aero.prefs.v1",
      JSON.stringify({
        locations: [
          place({ id: 1, latitude: 52.52, longitude: 13.41 }),
          place({ id: 2, latitude: 52.521, longitude: 13.411 }), // near-dup
          place({ id: 3, name: "Paris", latitude: 48.85, longitude: 2.35 }),
        ],
      }),
    );
    const loaded = loadPrefs();
    expect(loaded.locations).toHaveLength(2);
  });

  it("returns defaults on malformed JSON", () => {
    window.localStorage.setItem("aero.prefs.v1", "{not json");
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("savePrefs persists and notifies subscribers", () => {
    let received: Prefs | null = null;
    const unsub = subscribePrefs((p) => (received = p));
    const next = prefsWith({ timeFormat: "24h" });
    savePrefs(next);
    expect((received as Prefs | null)?.timeFormat).toBe("24h");
    expect(loadPrefs().timeFormat).toBe("24h");
    unsub();
  });
});
