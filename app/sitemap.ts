import type { MetadataRoute } from "next";
import { SITE_URL } from "./robots";

/**
 * Only the real page (`/`) is listed. `/today`, `/forecast`, and `/locations`
 * are redirect() stubs that resolve to hash anchors on `/`, so listing them
 * as separate sitemap entries would be misleading to crawlers. `/settings`,
 * `/faq`, and `/privacy` are real standalone pages but are not included here
 * either; add them if they should be indexed independently of `/`.
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
