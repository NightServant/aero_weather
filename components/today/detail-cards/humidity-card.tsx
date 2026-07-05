"use client";

import { Droplets } from "lucide-react";
import { RailCard } from "./sunrise-sunset-card";
import { dewPoint as computeDewPointC, formatTemp, tempUnitLabel } from "@/lib/format";
import type { CurrentConditions, TempUnit } from "@/lib/api/types";

type Props = {
  current: CurrentConditions;
  unit: TempUnit;
};

/** Right-rail humidity card (Figma 10:11468): live humidity + dew point caption. */
export function HumidityCard({ current, unit }: Props) {
  const dp = resolveDewPoint(current, unit);
  return (
    <RailCard
      icon={<Droplets className="size-10 text-accent-droplet" strokeWidth={1.5} aria-hidden="true" />}
      label="Humidity"
      value={`${Math.round(current.humidity)}%`}
      caption={
        dp != null ? `Dew point ${formatTemp(dp, unit)}${tempUnitLabel(unit)}` : undefined
      }
    />
  );
}

/** API dew point when present (already in the pref unit); else Magnus fallback. */
function resolveDewPoint(current: CurrentConditions, unit: TempUnit): number | null {
  if (current.dewPoint != null && Number.isFinite(current.dewPoint)) return current.dewPoint;
  if (!Number.isFinite(current.temperature) || current.humidity <= 0) return null;
  const tempC =
    unit === "fahrenheit" ? ((current.temperature - 32) * 5) / 9 : current.temperature;
  const dpC = computeDewPointC(tempC, current.humidity);
  return unit === "fahrenheit" ? (dpC * 9) / 5 + 32 : dpC;
}
