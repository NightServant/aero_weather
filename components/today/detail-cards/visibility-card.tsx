"use client";

import { Eye } from "lucide-react";

/** Below-fold detail: live visibility distance. */
export function VisibilityCard({ meters }: { meters: number }) {
  const km = Math.round(meters / 1000);
  const desc =
    km >= 15
      ? "Clear out to the horizon"
      : km >= 8
        ? "Good visibility through the day"
        : km >= 3
          ? "Hazy - distant objects may appear soft"
          : "Low visibility - take care on the roads";

  return (
    <div className="tint-card flex flex-col p-5" data-animate="">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Eye className="size-4" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="card-subtitle-caps">Visibility</h3>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-value text-3xl">{km}</span>
        <span className="caption">km</span>
      </div>
      <p className="caption mt-3">{desc}</p>
    </div>
  );
}
