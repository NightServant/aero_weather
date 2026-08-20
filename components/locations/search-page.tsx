"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { usePrefs } from "@/hooks/use-prefs";
import { addPlace, findSamePlace } from "@/lib/prefs";
import { getSuggestedLocations } from "@/lib/suggested-locations";
import { useCitySearch } from "./use-city-search";
import { useLocationForecasts } from "./use-location-forecasts";
import { PlaceResultRow } from "./place-result-row";
import { SuggestedLocationRow } from "./suggested-location-row";
import type { Place } from "@/lib/api/types";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const { results, loading, failed } = useCitySearch(query);
  const [prefs, setPrefs, hydrated] = usePrefs();
  const router = useRouter();

  const suggested = useMemo(() => getSuggestedLocations(prefs.locations), [prefs.locations]);
  const forecasts = useLocationForecasts(suggested, prefs.units);

  const onSelect = (place: Place) => {
    setPrefs((p) => {
      const { list, id } = addPlace(p.locations, place);
      return { ...p, locations: list, activeLocationId: id };
    });
    toast.success(`${place.name} added to your locations`);
    router.push("/#today");
  };

  const showResults = query.trim().length > 0;

  return (
    <div className="pb-8">
      <div className="max-w-2xl">
        <p className="kicker">Search</p>
        <h1 className="text-headline mt-3">Find a city</h1>
        <p className="text-subtitle mt-2">
          Search by city name, ZIP code, or coordinates, or pick a suggestion below. Selected
          cities save to this device and become your active forecast.
        </p>

        <div className="mt-6 flex h-11 items-center gap-3 rounded-full border border-[var(--hairline-strong)] px-4">
          <Search className="size-4 shrink-0 text-foreground/55" strokeWidth={1.5} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search cities, ZIP codes, or coordinates"
            placeholder="Search cities, ZIP codes, or coordinates…"
            className="w-full min-w-0 flex-1 text-sm text-foreground placeholder:text-foreground/55 outline-none focus-visible:outline-none focus-visible:shadow-none"
          />
        </div>

        {showResults ? (
          <div className="mt-2">
            {query.trim().length < 2 ? (
              <p className="px-3 py-2 text-sm text-foreground/55">
                Type at least two characters to search.
              </p>
            ) : loading ? (
              <p className="px-3 py-2 text-sm text-foreground/55">Searching…</p>
            ) : failed ? (
              <p className="px-3 py-2 text-sm text-destructive" role="alert">
                Couldn&apos;t reach the city search. Check your connection and try again.
              </p>
            ) : results.length === 0 ? (
              <p className="px-3 py-2 text-sm text-foreground/55">No matches.</p>
            ) : (
              <ul className="space-y-1">
                {results.map((p) => (
                  <PlaceResultRow key={p.id} place={p} already={findSamePlace(prefs.locations, p)} onSelect={onSelect} />
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-10">
        <p className="kicker">Suggested places</p>
        <h2 className="text-headline mt-3 text-[1.5rem]">Popular right now</h2>

        {!hydrated ? (
          <ul className="mt-4">
            {Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="animate-pulse border-b border-[var(--hairline)] py-3.5 last:border-b-0">
                <div className="h-4 w-1/3 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/4 rounded bg-white/10" />
              </li>
            ))}
          </ul>
        ) : suggested.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/55">
            You&apos;ve already saved every suggested place.
          </p>
        ) : (
          <ul className="mt-4">
            {suggested.map((place) => (
              <SuggestedLocationRow
                key={place.id}
                place={place}
                units={prefs.units}
                forecast={forecasts[place.id]}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
