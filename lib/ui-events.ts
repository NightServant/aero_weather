/**
 * Window events that let a component elsewhere in the tree trigger a control
 * owned by the navbar. The footer advertises "Search cities" and "Use my
 * location", so those links have to do the thing, not just scroll near it.
 */
export const FOCUS_SEARCH_EVENT = "aero:focus-search";
export const USE_LOCATION_EVENT = "aero:use-location";

export function emitUiEvent(name: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(name));
}
