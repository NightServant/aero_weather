"use client";

import { useState } from "react";
import { LocationsHeader } from "@/components/locations/locations-header";
import { CityCardLoader } from "@/components/locations/city-card-loader";
import { AddCityDialog } from "@/components/locations/add-city-dialog";
import { usePrefs } from "@/hooks/use-prefs";
import { EmptyLocation } from "@/components/shell/empty-location";

export default function LocationsPage() {
  const [prefs, , hydrated] = usePrefs();
  const [addOpen, setAddOpen] = useState(false);

  if (!hydrated) return null;
  if (prefs.locations.length === 0) return <EmptyLocation />;

  return (
    <div className="space-y-8 pt-2">
      <LocationsHeader count={prefs.locations.length} onAddCity={() => setAddOpen(true)} />

      <div className="stagger-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {prefs.locations.map((place) => (
          <CityCardLoader
            key={place.id}
            place={place}
            units={prefs.units}
            format12h={prefs.timeFormat === "12h"}
            isActive={place.id === (prefs.activeLocationId ?? prefs.locations[0]?.id)}
          />
        ))}
      </div>

      <AddCityDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
