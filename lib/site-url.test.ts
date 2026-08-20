import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site-url";

describe("resolveSiteUrl", () => {
  it("prefers an explicit site URL over anything Vercel provides", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://aeroweather.example",
        VERCEL_PROJECT_PRODUCTION_URL: "aero-weather.vercel.app",
        VERCEL_BRANCH_URL: "aero-weather-git-main.vercel.app",
      }),
    ).toBe("https://aeroweather.example");
  });

  it("adds the protocol Vercel's bare hosts omit", () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "aero-weather.vercel.app" })).toBe(
      "https://aero-weather.vercel.app",
    );
  });

  it("uses the branch domain when there is no production one, so a preview does not claim the production URL", () => {
    expect(resolveSiteUrl({ VERCEL_BRANCH_URL: "aero-weather-git-fix.vercel.app" })).toBe(
      "https://aero-weather-git-fix.vercel.app",
    );
  });

  it("falls back to localhost rather than naming a domain nobody owns", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });

  it("treats an empty or whitespace value as unset", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" })).toBe("http://localhost:3000");
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "   " })).toBe("http://localhost:3000");
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "  ", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }),
    ).toBe("https://x.vercel.app");
  });

  it("strips trailing slashes, which would double up when a path is appended", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://aeroweather.example/" })).toBe(
      "https://aeroweather.example",
    );
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://aeroweather.example///" })).toBe(
      "https://aeroweather.example",
    );
  });

  it("keeps an explicit http origin rather than forcing https", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:4000" })).toBe(
      "http://localhost:4000",
    );
  });

  it("always returns something new URL() accepts", () => {
    const cases: Env[] = [
      {},
      { NEXT_PUBLIC_SITE_URL: "aeroweather.example" },
      { VERCEL_PROJECT_PRODUCTION_URL: "aero-weather.vercel.app/" },
      { VERCEL_BRANCH_URL: "branch.vercel.app" },
    ];
    for (const env of cases) expect(() => new URL(resolveSiteUrl(env))).not.toThrow();
  });
});

type Env = Record<string, string | undefined>;
