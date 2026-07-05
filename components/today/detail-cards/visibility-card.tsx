"use client";

import { Eye } from "lucide-react";
import { DetailTile } from "./detail-tile";

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
    <DetailTile
      icon={<Eye className="size-4" strokeWidth={1.5} aria-hidden="true" />}
      label="Visibility"
      value={km}
      unit="km"
      caption={desc}
    />
  );
}
