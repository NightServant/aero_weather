"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SectionHeader } from "./section-header";
import { CityCardSkeleton } from "@/components/locations/city-card-skeleton";
import { AddCityDialog } from "@/components/locations/add-city-dialog";
import { SummaryCardsSection } from "@/components/locations/summary-cards-section";
import { SuggestedLocationsCarousel } from "@/components/locations/suggested-locations-carousel";
import { LocationDetailsDialog, type DetailsMode } from "@/components/locations/location-details-dialog";
import { useLocationForecasts } from "@/components/locations/use-location-forecasts";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { Plus } from "lucide-react";
import { usePrefs } from "@/hooks/use-prefs";
import { getSuggestedLocations } from "@/lib/suggested-locations";
import { addPlace } from "@/lib/prefs";
import type { Place } from "@/lib/api/types";

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

export function LocationsSection() {
  const [prefs, setPrefs, hydrated] = usePrefs();
  const [addOpen, setAddOpen] = useState(false);
  const [details, setDetails] = useState<{ place: Place; mode: DetailsMode } | null>(null);
  const router = useRouter();

  const forecasts = useLocationForecasts(prefs.locations, prefs.units);
  const suggested = useMemo(() => getSuggestedLocations(prefs.locations), [prefs.locations]);

  if (!hydrated) return null;
  if (prefs.locations.length === 0) return null; // empty state handled by <AppSections/>

  const activeId = prefs.activeLocationId ?? prefs.locations[0]?.id ?? null;

  const openSaved = (place: Place) => setDetails({ place, mode: "saved" });
  const openSuggested = (place: Place) => setDetails({ place, mode: "suggested" });

  const saveLocation = (place: Place) => {
    setPrefs((p) => {
      const { list } = addPlace(p.locations, place);
      return { ...p, locations: list };
    });
    toast.success(`${place.name} added to your locations`);
    setDetails((d) => (d?.place.id === place.id ? null : d));
  };

  const removeLocation = (place: Place) => {
    setPrefs((p) => {
      const locations = p.locations.filter((l) => l.id !== place.id);
      const activeLocationId = p.activeLocationId === place.id ? (locations[0]?.id ?? null) : p.activeLocationId;
      return { ...p, locations, activeLocationId };
    });
    toast.success(`${place.name} removed`);
  };

  const viewForecast = (place: Place) => {
    setPrefs({ activeLocationId: place.id });
    router.push("/#today");
  };

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

      <SummaryCardsSection places={prefs.locations} forecasts={forecasts} activeId={activeId} units={prefs.units} />

      <LocationsCarousel places={prefs.locations} units={prefs.units} forecasts={forecasts} onOpenDetails={openSaved} />

      {suggested.length > 0 ? (
        <div className="space-y-4">
          <p className="card-subtitle-caps">Suggested places</p>
          <SuggestedLocationsCarousel places={suggested} units={prefs.units} onOpenDetails={openSuggested} onSave={saveLocation} />
        </div>
      ) : null}

      <AddCityDialog open={addOpen} onOpenChange={setAddOpen} />

      <LocationDetailsDialog
        place={details?.place ?? null}
        mode={details?.mode ?? "saved"}
        forecast={details ? forecasts[details.place.id] : undefined}
        units={prefs.units}
        format12h={prefs.timeFormat === "12h"}
        open={details !== null}
        onOpenChange={(o) => !o && setDetails(null)}
        onViewForecast={viewForecast}
        onRemove={removeLocation}
        onSave={saveLocation}
      />
    </div>
  );
}
