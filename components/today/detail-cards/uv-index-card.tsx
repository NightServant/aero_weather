"use client";

import { Moon, Sun } from "lucide-react";
import { RailCard } from "./sunrise-sunset-card";

/** Right-rail UV card (Figma 10:11643): live index + category, meter, advice. */
export function UvIndexCard({ uv, isDay = true }: { uv: number; isDay?: boolean }) {
  const pct = Math.min(100, Math.max(0, (uv / 11) * 100));
  const label =
    uv < 3 ? "Low" : uv < 6 ? "Moderate" : uv < 8 ? "High" : uv < 11 ? "Very high" : "Extreme";
  const advice =
    uv < 3
      ? "No protection needed"
      : uv < 6
        ? "Sunglasses help on bright surfaces"
        : "Sunscreen recommended between 11 AM and 3 PM";

  return (
    <RailCard
      icon={
        isDay ? (
          <Sun className="size-10 text-accent-sun" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Moon className="size-10 text-accent-sun" strokeWidth={1.5} aria-hidden="true" />
        )
      }
      label="UV Index"
      value={`${Math.round(uv)} ${label}`}
      caption={advice}
    >
      <div className="uv-gradient relative mt-3 h-1.5 overflow-hidden rounded-full" aria-hidden="true">
        <div
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
    </RailCard>
  );
}
