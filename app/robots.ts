import type { MetadataRoute } from "next";

/**
 * Canonical production origin for the app. No production domain is live yet,
 * so this falls back to the reserved aeroweather.app domain. Override with
 * NEXT_PUBLIC_SITE_URL once a real domain is wired up.
 *
 * Shared with app/sitemap.ts and app/layout.tsx (metadataBase).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aeroweather.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
