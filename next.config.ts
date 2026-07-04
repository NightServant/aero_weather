import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Wikipedia REST summary thumbnails (see lib/api/city-image.ts).
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "en.wikipedia.org", pathname: "/**" },
    ],
  },
};

export default nextConfig;
