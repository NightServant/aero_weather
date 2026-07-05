"use client";

import { MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/api/types";
import { usePrefs } from "@/hooks/use-prefs";

export function SearchTrigger({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const [prefs, setPrefs] = usePrefs();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const saved = prefs.locations;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return saved;
    return saved.filter((p) => {
      const hay = [p.name, p.admin1, p.country].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query, saved]);

  const onSelect = (place: Place) => {
    setPrefs({ activeLocationId: place.id });
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    router.push("/today");
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-12 items-center gap-3 rounded-full border border-[var(--hairline)] bg-card px-5 transition",
          "focus-within:border-[var(--hairline-strong)] hover:border-[var(--hairline-strong)]",
        )}
      >
        <Search className="size-4 shrink-0 text-foreground/55" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={
            saved.length === 0
              ? "No saved locations - add one from Locations"
              : "Switch saved location…"
          }
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/55 outline-none"
        />
        <kbd className="hidden items-center gap-0.5 rounded-md border border-[var(--hairline)] bg-background px-1.5 py-0.5 text-[10px] font-semibold text-foreground/60 md:inline-flex">
          {isMac ? "⌘" : "Ctrl"}K
        </kbd>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-[var(--hairline-strong)] bg-popover text-popover-foreground p-2 text-sm shadow-xl">
          {saved.length === 0 ? (
            <div className="px-3 py-3 text-foreground/55">
              No saved locations yet. Go to <span className="font-semibold text-foreground">Locations</span> and tap <span className="font-semibold text-foreground">Add city</span>.
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-2 text-foreground/55">No saved location matches “{query}”.</div>
          ) : (
            <ResultGroup heading="Saved locations">
              {filtered.map((p) => (
                <ResultRow key={p.id} place={p} onSelect={onSelect} active={p.id === prefs.activeLocationId} />
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <div className="px-3 pb-1 text-[10px] font-semibold tracking-[0.16em] uppercase text-foreground/45">
        {heading}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ResultRow({
  place,
  onSelect,
  active,
}: {
  place: Place;
  onSelect: (p: Place) => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(place)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-foreground/5",
        active && "bg-foreground/[0.04]",
      )}
    >
      <MapPin className="size-3.5 shrink-0 opacity-60" strokeWidth={1.5} />
      <span className="text-foreground">{place.name}</span>
      <span className="ml-2 truncate text-xs text-muted-foreground">
        {[place.admin1, place.country].filter(Boolean).join(", ")}
      </span>
      {active ? (
        <span className="ml-auto text-[10px] font-semibold tracking-wider uppercase text-foreground/60">
          Active
        </span>
      ) : null}
    </button>
  );
}
