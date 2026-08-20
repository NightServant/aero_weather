export const SECTION_IDS = ["today", "forecast", "locations"] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/**
 * Section anchors present in the document for a given saved-location state.
 *
 * AppSections drops the forecast and locations sections until a location is
 * saved, so nav and footer share this list rather than each hardcoding the
 * branch — linking to an absent anchor scrolls nowhere. Settings and FAQ are
 * not in this list at all: they are standalone routes (`/settings`, `/faq`),
 * not anchors in this scroll.
 */
export function visibleSectionIds(hasLocation: boolean): SectionId[] {
  return hasLocation ? [...SECTION_IDS] : ["today"];
}

export type SectionBox = { id: SectionId; top: number };

/** Fraction of the viewport height where the "you are here" marker sits. */
export const ACTIVE_MARKER_RATIO = 0.35;

/**
 * The section a reader is currently looking at.
 *
 * Uses a marker line a third of the way down the viewport and takes the last
 * section that has passed it. Two edge cases drive the shape:
 *
 * - The final section is often shorter than the remaining scroll, so it can
 *   never reach the marker. Once the page is scrolled to the bottom the last
 *   section wins outright, otherwise a short final section could never
 *   highlight.
 * - Before the first section reaches the marker (page top) the first section
 *   is still the answer, not "nothing".
 *
 * `sections` must be ordered by `top` ascending; `top` values are document
 * offsets, not viewport-relative.
 */
export function pickActiveSection(
  sections: SectionBox[],
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
): SectionId | null {
  if (sections.length === 0) return null;

  // Bottom of the page: nothing below can scroll into the marker any more.
  const atBottom = scrollY + viewportHeight >= documentHeight - 2;
  if (atBottom) return sections[sections.length - 1].id;

  const marker = scrollY + viewportHeight * ACTIVE_MARKER_RATIO;
  let active = sections[0].id;
  for (const section of sections) {
    if (section.top <= marker) active = section.id;
    else break;
  }
  return active;
}
