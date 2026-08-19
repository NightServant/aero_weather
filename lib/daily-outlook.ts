import { formatWeekdayShort } from "./format";

/** Below this the probability is noise and the row stays clean. */
export const PRECIP_VISIBLE_AT = 20;

/** First row is the day in progress, so it reads "Today" rather than its weekday. */
export function dayLabel(index: number, dateIso: string, timezone?: string): string {
  return index === 0 ? "Today" : formatWeekdayShort(dateIso, timezone);
}

/** Precipitation chance is only worth a slot when it is high enough to act on. */
export function showsPrecip(probability: number | null | undefined): boolean {
  return typeof probability === "number" && Number.isFinite(probability)
    ? probability >= PRECIP_VISIBLE_AT
    : false;
}
