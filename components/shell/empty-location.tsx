"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddCityDialog } from "@/components/locations/add-city-dialog";

export function EmptyLocation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto mt-20 max-w-lg text-center">
      <div className="eyebrow">Welcome to Aero</div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Pick a place to begin</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Search any city, ZIP code, or coordinate. Your selection lives on this device — no account required.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
      >
        <Plus className="size-4" strokeWidth={1.5} />
        Add a city
      </button>
      <AddCityDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
