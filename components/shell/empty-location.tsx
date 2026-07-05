"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddCityDialog } from "@/components/locations/add-city-dialog";

export function EmptyLocation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card mx-auto mt-16 max-w-xl px-8 py-12 text-center">
      <p className="kicker">Welcome to Aero</p>
      <h1 className="text-headline mt-3">Pick a place to begin</h1>
      <p className="text-subtitle mt-3">
        Search any city, ZIP code, or coordinate. Your selection lives on this device - no account
        required.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-accent active:scale-[0.98]"
      >
        <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Add a city
      </button>
      <AddCityDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
