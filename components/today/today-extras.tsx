"use client";

import { Leaf } from "lucide-react";
import { DetailTile } from "./detail-cards/detail-tile";
import { PressureCard } from "./detail-cards/pressure-card";
import { VisibilityCard } from "./detail-cards/visibility-card";
import { aqiCategory } from "@/lib/api/air-quality";
import { useInView } from "@/hooks/use-in-view";
import type { AirQuality, Forecast } from "@/lib/api/types";

type Props = {
  forecast: Forecast;
  airQuality: AirQuality | null;
};

/** Below-the-fold detail row: pressure, visibility, air quality (lazy-loaded). */
export function TodayExtras({ forecast, airQuality }: Props) {
  const { ref } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-animate="" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <PressureCard current={forecast.current.pressure} />
      <VisibilityCard meters={forecast.current.visibility} />
      <AirQualityCard airQuality={airQuality} />
    </div>
  );
}

function AirQualityCard({ airQuality }: { airQuality: AirQuality | null }) {
  const aqi = airQuality?.usAqi;
  const label = aqi != null ? aqiCategory(aqi).replace(/-/g, " ") : null;
  return (
    <DetailTile
      icon={<Leaf className="size-4" strokeWidth={1.5} aria-hidden="true" />}
      label="Air quality"
      value={aqi != null ? Math.round(aqi) : "--"}
      unit="US AQI"
      caption={<span className="capitalize">{label ?? "Unavailable"}</span>}
    />
  );
}
