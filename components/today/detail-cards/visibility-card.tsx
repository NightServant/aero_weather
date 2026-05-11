"use client";

import { Eye } from "lucide-react";

export function VisibilityCard({ meters }: { meters: number }) {
  const km = Math.round(meters / 1000);
  const desc =
    km >= 15
      ? "Clear out to the horizon. Marine layer building offshore."
      : km >= 8
        ? "Good visibility through the day."
        : km >= 3
          ? "Hazy — distant objects may appear soft."
          : "Low visibility — take care on the roads.";

  return (
    <div className="surface-card flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        <Eye className="size-3.5" strokeWidth={1.5} />
        <span className="eyebrow">Visibility</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tabular text-foreground">{km}</span>
        <span className="text-sm text-muted-foreground">km</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
