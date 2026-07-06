"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { HourlyCell } from "@/components/today/hourly-cell";
import { findNowIndex } from "@/lib/format";
import type { Forecast, UnitPrefs } from "@/lib/api/types";

type Props = {
  forecast: Forecast;
  units: UnitPrefs;
  format12h: boolean;
};

/** Carousel of the next 24 hours: embla track (free drag) + prev/next arrows. */
export function HourlyView({ forecast, units, format12h }: Props) {
  const nowIndex = Math.max(0, findNowIndex(forecast.hourly));
  const points = forecast.hourly.slice(nowIndex, nowIndex + 24);

  const [viewportRef, api] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
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
      aria-label="Hourly forecast, next 24 hours"
      className="tint-card flex items-center gap-2 p-3 backdrop-blur"
    >
      <IconCircleButton
        icon={<ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Earlier hours"
        size={40}
        disabled={!canPrev}
        onClick={() => api?.scrollPrev()}
        className="hidden md:grid"
      />

      <div ref={viewportRef} className="min-w-0 flex-1 overflow-hidden">
        <ul className="flex gap-1 p-1.5">
          {points.map((p, i) => (
            <li key={p.time} className="shrink-0 grow-0">
              <HourlyCell
                point={p}
                unit={units.temperature}
                format12h={format12h}
                isNow={i === 0}
                timezone={forecast.place.timezone}
              />
            </li>
          ))}
        </ul>
      </div>

      <IconCircleButton
        icon={<ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Later hours"
        size={40}
        disabled={!canNext}
        onClick={() => api?.scrollNext()}
        className="hidden md:grid"
      />
    </div>
  );
}
