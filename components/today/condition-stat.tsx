"use client";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  unit?: string;
  secondary?: string;
  accent?: string;
  className?: string;
};

export function ConditionStat({ label, value, unit, secondary, accent, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-[var(--hairline)] bg-[color-mix(in_oklch,var(--surface-card)_60%,transparent)] px-4 py-3 backdrop-blur",
        className,
      )}
    >
      <div className="eyebrow text-[10px]">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-foreground tabular">{value}</span>
        {unit ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
        {accent ? (
          <span className="ml-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--palette-accent,var(--accent))]">
            {accent}
          </span>
        ) : null}
      </div>
      {secondary ? <div className="text-xs text-muted-foreground">{secondary}</div> : null}
    </div>
  );
}
