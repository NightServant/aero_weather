"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchPlaces } from "@/lib/api/geocoding";
import type { Place } from "@/lib/api/types";
import { usePrefs } from "@/hooks/use-prefs";
import { addPlace, findSamePlace } from "@/lib/prefs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddCityDialog({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = usePrefs();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      searchPlaces(query, controller.signal)
        .then((r) => setResults(r))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  const onSelect = (place: Place) => {
    setPrefs((p) => {
      const { list } = addPlace(p.locations, place);
      return { ...p, locations: list };
    });
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
            placeholder="Search cities, ZIP codes, or coordinates…"
            className="flex-1 text-sm text-foreground placeholder:text-foreground/55 outline-none focus-visible:outline-none focus-visible:shadow-none"
          />
        </div>

        <div className="max-h-[55vh] overflow-y-auto overscroll-contain">
          {query.trim().length < 2 ? (
            <p className="px-3 py-2 text-sm text-foreground/55">
              Type at least two characters to search.
            </p>
          ) : loading ? (
            <p className="px-3 py-2 text-sm text-foreground/55">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-foreground/55">No matches.</p>
          ) : (
            <ul className="space-y-1">
              {results.map((p) => {
                const already = findSamePlace(prefs.locations, p);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(p)}
                      disabled={!!already}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-foreground/[0.04] disabled:cursor-default disabled:opacity-60"
                    >
                      <MapPin className="size-3.5 shrink-0 opacity-60" strokeWidth={1.5} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{p.name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {[p.admin1, p.country].filter(Boolean).join(", ")}
                        </div>
                      </div>
                      {already ? (
                        <span className="shrink-0 pl-2 text-[10px] font-semibold tracking-wider uppercase text-foreground/55">
                          Saved
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
