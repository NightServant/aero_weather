"use client";

import type { ReactNode } from "react";

/** One summary metric. Left accent border on desktop, bottom accent on mobile —
 *  identical to the Forecast/Settings summary cards. */
export function LocationSummaryCard({
  label,
  icon,
  value,
  unit,
  accent,
  children,
}: {
  label: string;
  icon: ReactNode;
  value: string | number;
  unit?: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col p-5 border-b border-white/12 md:border-b-0 md:border-l" data-animate="">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <h3 className="card-subtitle-caps">{label}</h3>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-value text-3xl truncate">{value}</span>
        {unit ? (
          <span
            className={
              accent
                ? "text-xs font-semibold text-[color:var(--palette-accent,var(--accent))]"
                : "caption"
            }
          >
            {unit}
          </span>
        ) : null}
      </div>
      <p className="caption mt-3">{children}</p>
    </div>
  );
}
