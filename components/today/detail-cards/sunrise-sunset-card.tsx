"use client";

import { Sunrise, Sunset } from "lucide-react";
import { GlassCard } from "@/components/aero/glass-card";
import { durationBetween, formatTime } from "@/lib/format";

type Props = {
  sunriseIso: string;
  sunsetIso: string;
  format12h: boolean;
  timezone?: string;
};

/** Right-rail pair (Figma 10:11580 / 10:11613): icon, label, live time, daylight caption. */
export function SunriseCard({ sunriseIso, sunsetIso, format12h, timezone }: Props) {
  return (
    <RailCard
      icon={<Sunrise className="size-10 text-accent-sun" strokeWidth={1.5} aria-hidden="true" />}
      label="Sunrise"
      value={formatTime(sunriseIso, format12h, timezone)}
      caption={`${durationBetween(sunriseIso, sunsetIso)} of daylight`}
    />
  );
}

export function SunsetCard({ sunriseIso, sunsetIso, format12h, timezone }: Props) {
  return (
    <RailCard
      icon={<Sunset className="size-10 text-accent-sun" strokeWidth={1.5} aria-hidden="true" />}
      label="Sunset"
      value={formatTime(sunsetIso, format12h, timezone)}
      caption={`${durationBetween(sunriseIso, sunsetIso)} of daylight`}
    />
  );
}

export function RailCard({
  icon,
  label,
  value,
  caption,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption?: string;
  children?: React.ReactNode;
}) {
  return (
    <GlassCard variant="glass" className="px-6 py-6" data-animate="">
      {icon}
      <h3 className="stat-title mt-4">
        {label} <span className="tabular">{value}</span>
      </h3>
      {caption ? <p className="caption mt-0.5">{caption}</p> : null}
      {children}
    </GlassCard>
  );
}
