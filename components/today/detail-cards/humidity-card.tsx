"use client";

import { Droplets } from "lucide-react";
import { RailCard } from "./sunrise-sunset-card";
import { formatTemp, resolveDewPoint, tempUnitLabel } from "@/lib/format";
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
