import { describe, expect, it } from "vitest";
import { SECTION_IDS, visibleSectionIds } from "./sections";

describe("visibleSectionIds", () => {
  it("exposes every section once a location is saved", () => {
    expect(visibleSectionIds(true)).toEqual([...SECTION_IDS]);
  });

  it("hides forecast and locations while no location is saved", () => {
    // AppSections renders only #today and #settings in the empty state, so nav
    // and footer must not link to anchors that are absent from the document.
    expect(visibleSectionIds(false)).toEqual(["today", "settings"]);
  });

  it("never returns an id outside the known section list", () => {
    for (const hasLocation of [true, false]) {
      for (const id of visibleSectionIds(hasLocation)) {
        expect(SECTION_IDS).toContain(id);
      }
    }
  });

  it("returns a fresh array so callers cannot mutate the source list", () => {
    const first = visibleSectionIds(true);
    first.pop();
    expect(visibleSectionIds(true)).toHaveLength(SECTION_IDS.length);
  });
});
