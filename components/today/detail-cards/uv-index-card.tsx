"use client";

import { Sun } from "lucide-react";

export function UvIndexCard({ uv }: { uv: number }) {
  const pct = Math.min(100, Math.max(0, (uv / 11) * 100));
  const label = uv < 3 ? "Low" : uv < 6 ? "Moderate" : uv < 8 ? "High" : uv < 11 ? "Very high" : "Extreme";
  const advice =
    uv < 3
      ? "No protection needed."
      : uv < 6
        ? "Sunglasses help on bright surfaces."
        : "Sunscreen recommended between 11 AM and 3 PM.";

  return (
    <DetailCard label="UV Index" icon={<Sun className="size-3.5" strokeWidth={1.5} />}>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-semibold tabular text-foreground">{Math.round(uv)}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full uv-gradient">
        <div
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{advice}</p>
    </DetailCard>
  );
}

function DetailCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="eyebrow">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
