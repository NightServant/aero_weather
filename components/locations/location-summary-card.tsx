"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** One summary metric. Left accent border on desktop, bottom accent on mobile —
 *  identical to the Forecast/Settings summary cards. */
export function LocationSummaryCard({
  label,
  icon,
  value,
  unit,
  accent,
  className,
  children,
}: {
  label: string;
  icon: ReactNode;
  value: string | number;
  unit?: string;
  accent?: boolean;
  /** Grid placement from the caller (column span at a given breakpoint). */
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col border-b border-white/12 p-4 sm:p-5 md:border-b-0 md:border-l",
        className,
      )}
      data-animate=""
    >
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <h3 className="card-subtitle-caps">{label}</h3>
      </div>
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="stat-value min-w-0 break-words text-3xl sm:truncate">{value}</span>
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
