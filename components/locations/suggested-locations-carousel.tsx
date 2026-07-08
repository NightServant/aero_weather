"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { SuggestedLocationCard } from "./suggested-location-card";
import type { Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  places: Place[];
  units: UnitPrefs;
  onOpenDetails: (place: Place) => void;
  onSave: (place: Place) => void;
};

export function SuggestedLocationsCarousel({ places, units, onOpenDetails, onSave }: Props) {
  const [viewportRef, api] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    breakpoints: { "(min-width: 768px)": { align: "start" } },
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (places.length === 0) return null;

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Suggested locations" className="flex items-center gap-4">
      <IconCircleButton
        icon={<ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Previous suggestions"
        size={48}
        disabled={!canPrev}
        onClick={() => api?.scrollPrev()}
        className="hidden md:grid"
      />

      <div ref={viewportRef} className="min-w-0 flex-1 overflow-hidden">
        <div className="-ml-4 flex md:-ml-6">
          {places.map((place, i) => (
            <div
              key={place.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${places.length}`}
              className="min-w-0 shrink-0 grow-0 basis-[78vw] pl-4 sm:basis-[280px] md:basis-[264px] md:pl-6 backdrop-blur"
            >
              <SuggestedLocationCard place={place} units={units} onOpenDetails={onOpenDetails} onSave={onSave} />
            </div>
          ))}
        </div>
      </div>

      <IconCircleButton
        icon={<ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Next suggestions"
        size={48}
        disabled={!canNext}
        onClick={() => api?.scrollNext()}
        className="hidden md:grid"
      />
    </div>
  );
}
