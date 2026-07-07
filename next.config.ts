import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev` blocks its HMR/dev resources (/_next/webpack-hmr, etc.) for any
  // browser origin other than localhost. Accessing the dev server over a LAN IP
  // (e.g. from a phone or another machine) otherwise loads the SSR HTML but never
  // hydrates — the app freezes on skeleton loaders. Allow LAN origins in dev.
  // Production (`next start` / Vercel) has no HMR and ignores this setting.
  allowedDevOrigins: ["192.168.3.140", "192.168.3.*"],
  images: {
    // Wikipedia REST summary thumbnails (see lib/api/city-image.ts).
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "en.wikipedia.org", pathname: "/**" },
    ],
  },
};

export default nextConfig;
