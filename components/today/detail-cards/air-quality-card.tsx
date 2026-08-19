"use client";

import { Leaf } from "lucide-react";
import { RailCard } from "./sunrise-sunset-card";
import { aqiBand, aqiDialFraction } from "@/lib/air-quality-bands";

const RADIUS = 30;
const CIRC = 2 * Math.PI * RADIUS;

/**
 * US AQI for the active place. The reading was already being fetched alongside
 * the forecast and thrown away; this is the card that shows it.
 */
export function AirQualityCard({ usAqi }: { usAqi: number }) {
  const { label, color, advice } = aqiBand(usAqi);
  const rounded = Math.round(usAqi);
  const filled = aqiDialFraction(usAqi) * CIRC;

  return (
    <RailCard
      icon={<Leaf className="size-7 sm:size-10" style={{ color }} strokeWidth={1.5} aria-hidden="true" />}
      label="Air quality"
      value={label}
      caption={advice}
      side={
        <svg
          viewBox="0 0 72 72"
          className="size-[68px] shrink-0 -rotate-90"
          role="img"
          aria-label={`US AQI ${rounded}, ${label}`}
        >
          <circle cx="36" cy="36" r={RADIUS} fill="none" stroke="oklch(1 0 0 / 0.14)" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRC - filled}`}
          />
          <text
            x="36"
            y="36"
            textAnchor="middle"
            dominantBaseline="central"
            transform="rotate(90 36 36)"
            className="tabular fill-text-strong text-[17px] font-semibold"
          >
            {rounded}
          </text>
        </svg>
      }
    />
  );
}
