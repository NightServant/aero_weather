"use client";

import { useEffect, useState } from "react";
import { searchPlaces } from "@/lib/api/geocoding";
import type { Place } from "@/lib/api/types";

export type CitySearchState = {
  results: Place[];
  loading: boolean;
  /** A request that reached the network and failed - distinct from "no
   *  matches", which is a successful response with an empty result set. */
  failed: boolean;
};

/**
 * Debounced geocoding search shared by the add-city dialog and the /search
 * page. Keeps three distinct states (searching / no matches / request
 * failed) - conflating a failed request with "no matches" is a bug this
 * project already fixed once, so any new caller must go through here rather
 * than re-implement the debounce and error handling.
 */
export function useCitySearch(query: string): CitySearchState {
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setFailed(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      searchPlaces(query, controller.signal)
        .then((r) => {
          setResults(r);
          setFailed(false);
        })
        .catch((err) => {
          // An aborted request is the cleanup path for a superseded keystroke,
          // not a failure the user should be told about.
          if (controller.signal.aborted || (err as Error)?.name === "AbortError") return;
          setResults([]);
          setFailed(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  return { results, loading, failed };
}
