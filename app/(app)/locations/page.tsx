"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LocationsHeader, type LocationsView } from "@/components/locations/locations-header";
import { LocationsList } from "@/components/locations/locations-list";
import { CityCardSkeleton } from "@/components/locations/city-card-skeleton";
import { AddCityDialog } from "@/components/locations/add-city-dialog";
import { usePrefs } from "@/hooks/use-prefs";
import { EmptyLocation } from "@/components/shell/empty-location";

// Below-the-heading embla bundle only loads when the carousel view renders.
const LocationsCarousel = dynamic(
  () =>
    import("@/components/locations/locations-carousel").then((m) => ({
      default: m.LocationsCarousel,
    })),
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

export default function LocationsPage() {
  const [prefs, , hydrated] = usePrefs();
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<LocationsView>("carousel");

  if (!hydrated) return null;
  if (prefs.locations.length === 0) return <EmptyLocation />;

  const activeId = prefs.activeLocationId ?? prefs.locations[0]?.id;

  return (
    <div className="space-y-8 pt-2">
      <LocationsHeader
        count={prefs.locations.length}
        view={view}
        onViewChange={setView}
        onAddCity={() => setAddOpen(true)}
      />

      <div
        role="tabpanel"
        id={`locations-view-${view}`}
        aria-labelledby={`locations-view-tab-${view}`}
        className="stagger-4"
      >
        {view === "carousel" ? (
          <LocationsCarousel places={prefs.locations} units={prefs.units} activeId={activeId} />
        ) : (
          <LocationsList places={prefs.locations} units={prefs.units} activeId={activeId} />
        )}
      </div>

      <hr className="border-white/[0.08]" />

      <AddCityDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
