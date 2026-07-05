"use client";

import { useEffect, useState } from "react";
import { getCityImage } from "@/lib/api/city-image";
import type { Place } from "@/lib/api/types";

/**
 * Resolves a representative photo for a place.
 * `undefined` = still loading (render a skeleton box),
 * `null` = no image available (render the gradient fallback),
 * `string` = URL for `next/image`.
 */
export function useCityImage(place: Place): string | null | undefined {
  const [src, setSrc] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setSrc(undefined);
    getCityImage(place).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [place]);

  return src;
}
