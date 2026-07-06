type FetchOpts = {
  revalidate?: number;
  signal?: AbortSignal;
};

export async function getJSON<T>(
  url: string,
  params: Record<string, string | number | boolean | string[] | undefined>,
  opts: FetchOpts = {},
): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    qs.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const started = performance.now();
  const res = await fetch(`${url}?${qs.toString()}`, {
    signal: opts.signal,
    next: { revalidate: opts.revalidate ?? 600 },
  });
  if (process.env.NODE_ENV !== "production") {
    console.log(`[fetch ${Math.round(performance.now() - started)}ms] ${url}`);
  }
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}
