export type ConsentChoice = "granted" | "denied";

export const CONSENT_KEY = "aero.consent.analytics.v1";

/** Narrow an untrusted localStorage value to a choice, or null if unset. */
export function parseConsent(raw: string | null): ConsentChoice | null {
  return raw === "granted" || raw === "denied" ? raw : null;
}

/** Measurement only runs on an explicit opt-in, never on an absent choice. */
export function shouldLoadAnalytics(
  choice: ConsentChoice | null,
  measurementId: string | undefined,
): boolean {
  return choice === "granted" && Boolean(measurementId);
}

/** The banner is only worth showing when a decision is still outstanding and
 *  there is a measurement id for that decision to gate. */
export function shouldPromptForConsent(
  choice: ConsentChoice | null,
  measurementId: string | undefined,
): boolean {
  return choice === null && Boolean(measurementId);
}

// --- external store -------------------------------------------------------
// Exposed as a store so the banner can read localStorage through
// useSyncExternalStore instead of syncing it into state from an effect.

const listeners = new Set<() => void>();

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getConsentSnapshot(): ConsentChoice | null {
  try {
    return parseConsent(window.localStorage.getItem(CONSENT_KEY));
  } catch {
    // Private mode or blocked storage: fall back to "no decision made".
    return null;
  }
}

/** The server has no storage to read, so it always renders the pre-choice UI. */
export function getConsentServerSnapshot(): ConsentChoice | null {
  return null;
}

export function setConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // A refusal we cannot persist still holds for this page view.
  }
  listeners.forEach((l) => l());
}
