type Env = Record<string, string | undefined>;

const LOCAL_FALLBACK = "http://localhost:3000";

const clean = (value: string) => value.trim().replace(/\/+$/, "");

/** Vercel exposes bare hosts, e.g. "aero-weather.vercel.app". */
const withProtocol = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

/**
 * The site's own absolute origin, used by robots.txt, the sitemap and
 * `metadataBase`.
 *
 * Every route here is static, so whatever this resolves to is baked into the
 * output at build time: changing it later needs a rebuild, not just a new
 * environment value.
 *
 * Order matters. An explicit `NEXT_PUBLIC_SITE_URL` is the custom domain and
 * always wins. Otherwise Vercel's own variables are correct by construction:
 * the production domain for production builds, the branch domain for previews
 * so a preview never advertises the production URL. Next resolves
 * `metadataBase` from the same two variables. Locally there is no domain to
 * guess, so it says so rather than naming one nobody owns.
 */
export function resolveSiteUrl(env: Env = process.env): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return withProtocol(clean(explicit));

  const production = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return withProtocol(clean(production));

  const branch = env.VERCEL_BRANCH_URL?.trim();
  if (branch) return withProtocol(clean(branch));

  return LOCAL_FALLBACK;
}

export const SITE_URL = resolveSiteUrl();
