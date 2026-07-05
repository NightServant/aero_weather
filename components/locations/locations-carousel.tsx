"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { CityCardLoader } from "./city-card-loader";
import type { Place, UnitPrefs } from "@/lib/api/types";

type Props = {
  places: Place[];
  units: UnitPrefs;
  activeId: number | undefined;
};

/**
 * Saved-locations carousel (spec 6/7): embla track with 240px cards on
 * desktop plus 48px round prev/next buttons at the row's sides; below md the
 * arrows hide and slides snap-center at ~78vw via embla's touch drag.
 */
export function LocationsCarousel({ places, units, activeId }: Props) {
  const [viewportRef, api] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    breakpoints: {
      "(min-width: 768px)": { align: "start" },
    },
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

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Saved locations"
      className="flex items-center gap-4"
    >
      <IconCircleButton
        icon={<ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Previous locations"
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
              className="min-w-0 shrink-0 grow-0 basis-[78vw] pl-4 sm:basis-[280px] md:basis-[264px] md:pl-6"
            >
              <CityCardLoader place={place} units={units} isActive={place.id === activeId} />
            </div>
          ))}
        </div>
      </div>

      <IconCircleButton
        icon={<ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Next locations"
        size={48}
        disabled={!canNext}
        onClick={() => api?.scrollNext()}
        className="hidden md:grid"
      />
    </div>
  );
}
