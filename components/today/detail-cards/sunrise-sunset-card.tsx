"use client";

import { Sunrise } from "lucide-react";
import { durationBetween, formatTime } from "@/lib/format";

type Props = {
  sunriseIso: string;
  sunsetIso: string;
  format12h: boolean;
  timezone?: string;
};

export function SunriseSunsetCard({ sunriseIso, sunsetIso, format12h, timezone }: Props) {
  const sunrise = formatTime(sunriseIso, format12h, timezone);
  const sunset = formatTime(sunsetIso, format12h, timezone);
  const daylight = durationBetween(sunriseIso, sunsetIso);

  const now = new Date();
  const start = new Date(sunriseIso).getTime();
  const end = new Date(sunsetIso).getTime();
  const ratio = Math.min(1, Math.max(0, (now.getTime() - start) / Math.max(1, end - start)));
  const cx = 10 + ratio * 80;
  const cy = 40 - Math.sin(ratio * Math.PI) * 28;

  return (
    <div className="surface-card flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Sunrise className="size-3.5" strokeWidth={1.5} />
        <span className="eyebrow">Sunrise &amp; Sunset</span>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <svg viewBox="0 0 100 50" className="h-14 w-full">
          <path
            d="M5 42 A 45 30 0 0 1 95 42"
            fill="none"
            stroke="var(--scene-accent, var(--accent))"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={3.5} fill="var(--scene-accent, var(--accent))" />
        </svg>
        <div className="flex flex-col gap-1 text-sm tabular">
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="text-foreground/50">↑</span> {sunrise}
          </span>
          <span className="flex items-center gap-1.5 text-foreground">
            <span className="text-foreground/50">↓</span> {sunset}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{daylight} daylight</p>
    </div>
  );
}
