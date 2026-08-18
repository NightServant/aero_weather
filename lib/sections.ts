export const SECTION_IDS = ["today", "forecast", "locations", "settings"] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/**
 * Section anchors present in the document for a given saved-location state.
 *
 * AppSections drops the forecast and locations sections until a location is
 * saved, so nav and footer share this list rather than each hardcoding the
 * branch — linking to an absent anchor scrolls nowhere.
 */
export function visibleSectionIds(hasLocation: boolean): SectionId[] {
  return hasLocation ? [...SECTION_IDS] : ["today", "settings"];
}
