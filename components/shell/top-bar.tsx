"use client";

import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { SearchTrigger } from "@/components/search/search-trigger";
import { ThemeToggle } from "./theme-toggle";
import { usePrefs } from "@/hooks/use-prefs";
import { reverseGeocode } from "@/lib/api/geocoding";
import { addPlace } from "@/lib/prefs";

export function TopBar() {
  const [, setPrefs] = usePrefs();

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported in this browser.");
      return;
    }
    toast.loading("Finding your location…", { id: "geo" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const place = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (!place) {
            toast.error("Couldn't identify your location.", { id: "geo" });
            return;
          }
          setPrefs((p) => {
            const { list, id } = addPlace(p.locations, place);
            return { ...p, locations: list, activeLocationId: id };
          });
          toast.success(`Located: ${place.name}`, { id: "geo" });
        } catch {
          toast.error("Location lookup failed.", { id: "geo" });
        }
      },
      () => toast.error("Location permission denied.", { id: "geo" }),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  return (
    <div className="flex items-center gap-3 px-10 pt-7 pb-4">
      <SearchTrigger className="flex-1" />
      <ThemeToggle />
      <button
        type="button"
        aria-label="Use my location"
        onClick={useMyLocation}
        className="grid size-10 place-items-center rounded-full border border-[var(--hairline)] bg-card text-foreground/70 transition hover:text-foreground hover:border-[var(--hairline-strong)]"
      >
        <MapPin className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
