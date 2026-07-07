"use client";

import { Sunrise, Sunset } from "lucide-react";
import { GlassCard } from "@/components/aero/glass-card";
import { durationBetween, formatMinutes, formatTime } from "@/lib/format";

/** Night length for the day = 24h minus the daylight window. */
function nightLength(sunriseIso: string, sunsetIso: string): string {
  const dayMs = new Date(sunsetIso).getTime() - new Date(sunriseIso).getTime();
  return formatMinutes((86_400_000 - dayMs) / 60000);
}

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
      icon={<Sunrise className="size-9 text-accent-sun sm:size-10" strokeWidth={1.5} aria-hidden="true" />}
      label="Sunrise"
      value={formatTime(sunriseIso, format12h, timezone)}
      caption={`${durationBetween(sunriseIso, sunsetIso)} of daylight`}
    />
  );
}

export function SunsetCard({ sunriseIso, sunsetIso, format12h, timezone }: Props) {
  return (
    <RailCard
      icon={<Sunset className="size-9 text-accent-sun sm:size-10" strokeWidth={1.5} aria-hidden="true" />}
      label="Sunset"
      value={formatTime(sunsetIso, format12h, timezone)}
      caption={`${nightLength(sunriseIso, sunsetIso)} of night ahead`}
    />
  );
}

export function RailCard({
  icon,
  label,
  value,
  caption,
  children,
  side,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption?: string;
  children?: React.ReactNode;
  /** Optional element pinned to the right of the text, vertically centered. */
  side?: React.ReactNode;
}) {
  const body = (
    <>
      {icon}
      <h3 className="stat-title mt-3 sm:mt-4">
        {label} <span className="tabular whitespace-nowrap">{value}</span>
      </h3>
      {caption ? <p className="caption mt-0.5">{caption}</p> : null}
      {children}
    </>
  );
  return (
    <GlassCard variant="tint" className="h-full p-5 backdrop-blur sm:px-6 sm:py-6" data-animate="">
      {side ? (
        // Text left, side element right, vertically centered. The one-card carousel
        // and the sm+ grid both give the card enough width for this side by side.
        <div className="flex h-full items-center gap-4">
          <div className="min-w-0 flex-1">{body}</div>
          <div className="shrink-0">{side}</div>
        </div>
      ) : (
        body
      )}
    </GlassCard>
  );
}
