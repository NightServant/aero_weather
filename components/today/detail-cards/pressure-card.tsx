"use client";

import { Gauge } from "lucide-react";
import { DetailTile } from "./detail-tile";

/** Below-fold detail: live sea-level pressure. */
export function PressureCard({ current }: { current: number }) {
  return (
    <DetailTile
      icon={<Gauge className="size-4" strokeWidth={1.5} aria-hidden="true" />}
      label="Pressure"
      value={Math.round(current)}
      unit="hPa"
      caption="Surface pressure at the station level"
    />
  );
}
