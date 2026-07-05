"use client";

import { Leaf } from "lucide-react";
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
    <div className="tint-card flex flex-col p-5" data-animate="">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Leaf className="size-4" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="card-subtitle-caps">Air quality</h3>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-value text-3xl">{aqi != null ? Math.round(aqi) : "--"}</span>
        <span className="caption">US AQI</span>
      </div>
      <p className="caption mt-3 capitalize">{label ?? "Unavailable"}</p>
    </div>
  );
}
