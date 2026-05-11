"use client";

import { Plus } from "lucide-react";

type Props = {
  count: number;
  onAddCity: () => void;
};

export function LocationsHeader({ count, onAddCity }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
      <div className="space-y-2">
        <div className="eyebrow stagger-1">My locations · {count} saved</div>
        <h1 className="stagger-2 text-[2.5rem] font-bold leading-tight tracking-tight text-foreground sm:text-[3rem]">
          Cities at a glance
        </h1>
        <p className="stagger-3 max-w-2xl text-sm text-muted-foreground">
          Tap any card to pin it as the active location.
        </p>
      </div>
      <button
        type="button"
        onClick={onAddCity}
        className="stagger-3 inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-[var(--hairline-strong)]"
      >
        <Plus className="size-4" strokeWidth={1.5} />
        Add city
      </button>
    </header>
  );
}
