"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { usePrefs } from "@/hooks/use-prefs";

function PaletteSync() {
  const [prefs, , hydrated] = usePrefs();
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.palette = prefs.palette;
  }, [prefs.palette, hydrated]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <PaletteSync />
      {children}
    </ThemeProvider>
  );
}
