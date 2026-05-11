"use client";

import { useTheme as useNextTheme } from "next-themes";
import { usePrefs } from "./use-prefs";
import type { PaletteKey, PaletteMode } from "@/lib/prefs";

export function useThemePrefs() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [prefs, setPrefs] = usePrefs();

  return {
    theme: theme ?? "system",
    resolvedTheme: resolvedTheme ?? "light",
    setTheme,
    palette: prefs.palette,
    paletteMode: prefs.paletteMode,
    setPalette: (palette: PaletteKey) => setPrefs({ palette, paletteMode: "manual" }),
    setPaletteMode: (paletteMode: PaletteMode) => setPrefs({ paletteMode }),
  };
}
