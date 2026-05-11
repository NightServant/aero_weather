"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFS, loadPrefs, savePrefs, subscribePrefs, type Prefs } from "@/lib/prefs";

export function usePrefs(): [Prefs, (updater: Partial<Prefs> | ((p: Prefs) => Prefs)) => void, boolean] {
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefsState(loadPrefs());
    setHydrated(true);
    const unsub = subscribePrefs((p) => setPrefsState(p));
    return unsub;
  }, []);

  const setPrefs = useCallback(
    (updater: Partial<Prefs> | ((p: Prefs) => Prefs)) => {
      setPrefsState((current) => {
        const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
        queueMicrotask(() => savePrefs(next));
        return next;
      });
    },
    [],
  );

  return [prefs, setPrefs, hydrated];
}
