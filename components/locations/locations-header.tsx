"use client";

import { MapPin, Plus } from "lucide-react";
import { GlassCard } from "@/components/aero/glass-card";
import { PillTabs } from "@/components/aero/pill-tabs";

export type LocationsView = "carousel" | "list";

type Props = {
  count: number;
  view: LocationsView;
  onViewChange: (view: LocationsView) => void;
  onAddCity: () => void;
};

/** Figma header: pin card (kicker + saved count) left, Carousel/List tabs +
 *  Add city right; the blue page headline card sits below. */
export function LocationsHeader({ count, view, onViewChange, onAddCity }: Props) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <GlassCard variant="glass" className="stagger-1 px-5 py-4">
          <MapPin className="size-6 text-accent-pin" strokeWidth={1.75} aria-hidden="true" />
          <p className="kicker mt-2">My Locations</p>
          <p className="caption mt-0.5">
            {count} saved
          </p>
        </GlassCard>

        <div className="stagger-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onAddCity}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-accent active:scale-[0.98]"
          >
            <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Add city
          </button>
          <PillTabs
            tabs={[
              { value: "carousel", label: "Carousel" },
              { value: "list", label: "List" },
            ]}
            value={view}
            onValueChange={(v) => onViewChange(v as LocationsView)}
            ariaLabel="Locations view"
            panelIdPrefix="locations-view"
          />
        </div>
      </div>

      <GlassCard variant="glass" className="stagger-3 px-8 py-8">
        <h1 className="text-headline">Places at a glance</h1>
        <p className="text-subtitle mt-2">View weather activities of saved places.</p>
      </GlassCard>
    </>
  );
}
