"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Place } from "@/lib/api/types";
import { usePrefs } from "@/hooks/use-prefs";
import { addPlace, findSamePlace } from "@/lib/prefs";
import { useCitySearch } from "./use-city-search";
import { PlaceResultRow } from "./place-result-row";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddCityDialog({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const { results, loading, failed } = useCitySearch(query);
  const [prefs, setPrefs] = usePrefs();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  const onSelect = (place: Place) => {
    setPrefs((p) => {
      const { list } = addPlace(p.locations, place);
      return { ...p, locations: list };
    });
    toast.success(`Added ${place.name}.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg tint-card backdrop-blur"
        style={{ background: "oklch(0.2 0.025 245 / 0.77)" }}
      >
        <DialogHeader>
          <DialogTitle>Add a city</DialogTitle>
          <DialogDescription>
            Search by city name, ZIP code, or coordinates. Selected cities save to this device.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-11 items-center gap-3 rounded-full border border-[var(--hairline-strong)] px-4">
          <Search className="size-4 shrink-0 text-foreground/55" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search cities, ZIP codes, or coordinates"
            placeholder="Search cities, ZIP codes, or coordinates…"
            className="w-full min-w-0 flex-1 text-sm text-foreground placeholder:text-foreground/55 outline-none focus-visible:outline-none focus-visible:shadow-none"
          />
        </div>

        <div className="max-h-[55vh] overflow-y-auto overscroll-contain">
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
      </DialogContent>
    </Dialog>
  );
}
