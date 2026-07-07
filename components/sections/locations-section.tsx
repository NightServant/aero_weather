"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { SectionHeader } from "./section-header";
import { CityCardSkeleton } from "@/components/locations/city-card-skeleton";
import { AddCityDialog } from "@/components/locations/add-city-dialog";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { Plus } from "lucide-react";
import { usePrefs } from "@/hooks/use-prefs";

const LocationsCarousel = dynamic(
  () => import("@/components/locations/locations-carousel").then((m) => ({ default: m.LocationsCarousel })),
  {
    ssr: false,
    loading: () => (
      <div aria-busy="true" className="flex gap-6 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-[264px] shrink-0">
            <CityCardSkeleton />
          </div>
        ))}
      </div>
    ),
  },
);

/** Locations section: carousel only (purer scroll — no Carousel/List switcher). */
export function LocationsSection() {
  const [prefs, , hydrated] = usePrefs();
  const [addOpen, setAddOpen] = useState(false);

  if (!hydrated) return null;
  if (prefs.locations.length === 0) return null; // empty state handled once by <AppSections/>

  const activeId = prefs.activeLocationId ?? prefs.locations[0]?.id;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <SectionHeader
            id="locations-h"
            kicker={`My locations — ${prefs.locations.length} saved`}
            title="Places at a glance"
            subtitle="View weather across your saved places."
          />
        </div>
        <IconCircleButton label="Add a city" onClick={() => setAddOpen(true)} icon={<Plus className="size-4" strokeWidth={1.5} />} />
      </div>

      <LocationsCarousel places={prefs.locations} units={prefs.units} activeId={activeId} />

      <AddCityDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
