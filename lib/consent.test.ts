import { describe, expect, it } from "vitest";
import { parseConsent, shouldLoadAnalytics, shouldPromptForConsent } from "./consent";

describe("parseConsent", () => {
  it("accepts the two valid choices", () => {
    expect(parseConsent("granted")).toBe("granted");
    expect(parseConsent("denied")).toBe("denied");
  });

  it("treats an absent or corrupted value as no choice", () => {
    for (const raw of [null, "", "true", "yes", "{}"]) {
      expect(parseConsent(raw)).toBeNull();
    }
  });
});

describe("shouldLoadAnalytics", () => {
  it("loads only on an explicit grant", () => {
    expect(shouldLoadAnalytics("granted", "G-ABC")).toBe(true);
  });

  it("never loads without a decision or after a refusal", () => {
    expect(shouldLoadAnalytics(null, "G-ABC")).toBe(false);
    expect(shouldLoadAnalytics("denied", "G-ABC")).toBe(false);
  });

  it("never loads when no measurement id is configured", () => {
    expect(shouldLoadAnalytics("granted", undefined)).toBe(false);
    expect(shouldLoadAnalytics("granted", "")).toBe(false);
  });
});

describe("shouldPromptForConsent", () => {
  it("prompts only while the choice is outstanding", () => {
    expect(shouldPromptForConsent(null, "G-ABC")).toBe(true);
    expect(shouldPromptForConsent("granted", "G-ABC")).toBe(false);
    expect(shouldPromptForConsent("denied", "G-ABC")).toBe(false);
  });

  it("stays silent when there is nothing to consent to", () => {
    expect(shouldPromptForConsent(null, undefined)).toBe(false);
  });
});
