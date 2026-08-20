import { describe, expect, it } from "vitest";
import { SECTION_IDS, pickActiveSection, visibleSectionIds } from "./sections";

describe("visibleSectionIds", () => {
  it("exposes every section once a location is saved", () => {
    expect(visibleSectionIds(true)).toEqual([...SECTION_IDS]);
  });

  it("hides forecast and locations while no location is saved", () => {
    // AppSections renders only #today in the empty state, so nav and footer
    // must not link to anchors that are absent from the document. Settings and
    // FAQ are standalone routes now, not part of this scroll at all.
    expect(visibleSectionIds(false)).toEqual(["today"]);
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

describe("pickActiveSection", () => {
  // A page of three 700px sections in a 900px viewport. Locations, the last
  // section since settings moved off this scroll, is only 400px tall.
  const sections = [
    { id: "today" as const, top: 0 },
    { id: "forecast" as const, top: 700 },
    { id: "locations" as const, top: 1400 },
  ];
  const VH = 900;
  const DOC = 1400 + 400 + VH; // last section is only 400px tall

  const pick = (scrollY: number) => pickActiveSection(sections, scrollY, VH, DOC);

  it("returns null when there are no sections", () => {
    expect(pickActiveSection([], 0, VH, DOC)).toBeNull();
  });

  it("reports the first section at the top of the page", () => {
    expect(pick(0)).toBe("today");
  });

  it("advances only once a section has passed the marker", () => {
    // Marker sits at scrollY + 315. Forecast starts at 700.
    expect(pick(384)).toBe("today");
    expect(pick(385)).toBe("forecast");
  });

  it("tracks the middle sections while scrolling", () => {
    // Marker sits at scrollY + 315. Locations starts at 1400.
    expect(pick(1084)).toBe("forecast");
    expect(pick(1085)).toBe("locations");
  });

  it("selects the final section once scrolled to the bottom", () => {
    // The regression this replaces: a short last section never reaches the
    // marker, so the nav stayed stuck on the previous section.
    expect(pick(DOC - VH)).toBe("locations");
  });

  it("never returns a section the caller did not supply", () => {
    const partial = [
      { id: "today" as const, top: 0 },
      { id: "locations" as const, top: 700 },
    ];
    for (const y of [0, 300, 700, 1200, 5000]) {
      expect(["today", "locations"]).toContain(
        pickActiveSection(partial, y, VH, 700 + 400 + VH),
      );
    }
  });
});
