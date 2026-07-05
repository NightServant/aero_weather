"use client";

import { Gauge } from "lucide-react";

/** Below-fold detail: live sea-level pressure. */
export function PressureCard({ current }: { current: number }) {
  return (
    <div className="tint-card flex flex-col p-5" data-animate="">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Gauge className="size-4" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="card-subtitle-caps">Pressure</h3>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-value text-3xl">{Math.round(current)}</span>
        <span className="caption">hPa</span>
      </div>
      <p className="caption mt-3">Surface pressure at the station level</p>
    </div>
  );
}
