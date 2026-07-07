"use client";

import { Moon, Sun } from "lucide-react";
import { RailCard } from "./sunrise-sunset-card";

/** WHO UV exposure bands, each with its own risk color (low green -> extreme violet). */
const UV_BANDS = [
  { label: "Low", color: "oklch(0.78 0.16 150)" },
  { label: "Moderate", color: "oklch(0.86 0.17 95)" },
  { label: "High", color: "oklch(0.74 0.17 55)" },
  { label: "Very high", color: "oklch(0.64 0.23 27)" },
  { label: "Extreme", color: "oklch(0.60 0.22 320)" },
] as const;

function uvBandIndex(uv: number): number {
  if (uv < 3) return 0;
  if (uv < 6) return 1;
  if (uv < 8) return 2;
  if (uv < 11) return 3;
  return 4;
}

const RADIUS = 30;
const CIRC = 2 * Math.PI * RADIUS;
/** UV maxes out around 11 on the WHO scale; the dial fills against that. */
const UV_MAX = 11;

/** Right-rail UV card: a radial dial for the live index, coloured by risk band. */
export function UvIndexCard({ uv, isDay = true }: { uv: number; isDay?: boolean }) {
  const active = uvBandIndex(uv);
  const { label, color } = UV_BANDS[active];
  const rounded = Math.round(uv);
  const filled = Math.min(1, Math.max(0, uv / UV_MAX)) * CIRC;
  const advice =
    active === 0
      ? "No protection needed"
      : active < 2
        ? "Sunglasses help on bright surfaces"
        : "Sunscreen recommended between 11 AM and 3 PM";

  return (
    <RailCard
      icon={
        isDay ? (
          <Sun className="size-9 text-accent-sun sm:size-10" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Moon className="size-9 text-accent-sun sm:size-10" strokeWidth={1.5} aria-hidden="true" />
        )
      }
      label="UV Index"
      value={label}
      caption={advice}
      side={
        <svg
          viewBox="0 0 72 72"
          className="h-16 w-16"
          role="img"
          aria-label={`UV index ${rounded}, ${label}`}
        >
          <circle
            cx="36"
            cy="36"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-white/10"
          />
          <circle
            cx="36"
            cy="36"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRC}`}
            transform="rotate(-90 36 36)"
          />
          <text
            x="36"
            y="37"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[22px] font-semibold [font-variant-numeric:tabular-nums]"
            style={{ fill: color }}
          >
            {rounded}
          </text>
        </svg>
      }
    />
  );
}
