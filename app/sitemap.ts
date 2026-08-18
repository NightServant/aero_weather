import type { MetadataRoute } from "next";
import { SITE_URL } from "./robots";

/**
 * Only the real page (`/`) is listed. `/today`, `/forecast`, `/locations`,
 * and `/settings` are redirect() stubs that resolve to hash anchors on `/`,
 * so listing them as separate sitemap entries would be misleading to crawlers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
