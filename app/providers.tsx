"use client";

/** App-level providers. The sky palette on <html> is painted by
 *  ActiveForecastProvider (components/shell/active-forecast-context.tsx),
 *  the single writer of `data-palette`. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
