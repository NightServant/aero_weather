"use client";

import { Gauge } from "lucide-react";

type Props = {
  current: number;
  laterHours: number[];
};

export function PressureCard({ current, laterHours }: Props) {
  const future = laterHours[2] ?? current;
  const delta = future - current;
  const trend = delta > 0.4 ? "Rising" : delta < -0.4 ? "Falling" : "Stable";
  const detail =
    trend === "Rising"
      ? "Stable system through Wednesday"
      : trend === "Falling"
        ? "Front moving in — change ahead"
        : "Settled — no major shift expected";

  return (
    <div className="surface-card flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Gauge className="size-3.5" strokeWidth={1.5} />
        <span className="eyebrow">Pressure</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tabular text-foreground">{Math.round(current)}</span>
        <span className="text-sm text-muted-foreground">hPa</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2 text-xs">
        <span className="font-semibold text-[color:var(--scene-accent,var(--accent))]">
          {trend === "Rising" ? "↑" : trend === "Falling" ? "↓" : "·"} {trend}
        </span>
        <span className="text-muted-foreground">· {detail}</span>
      </div>
    </div>
  );
}
