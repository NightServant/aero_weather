"use client";

import { cn } from "@/lib/utils";

export type ForecastView = "hourly" | "daily" | "grid";

type Props = {
  title: string;
  subtitle: string;
  view: ForecastView;
  onChangeView: (v: ForecastView) => void;
};

const OPTIONS: { value: ForecastView; label: string }[] = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "grid", label: "Grid" },
];

export function ForecastHeader({ title, subtitle, view, onChangeView }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
      <div className="space-y-2">
        <div className="eyebrow stagger-1">7-Day Outlook</div>
        <h1 className="stagger-2 text-[2.5rem] font-bold leading-tight tracking-tight text-foreground sm:text-[3rem]">
          {title}
        </h1>
        <p className="stagger-3 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="stagger-3 inline-flex rounded-full border border-[var(--hairline)] bg-card p-1 text-sm">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChangeView(opt.value)}
            className={cn(
              "rounded-full px-4 py-1.5 font-medium transition-colors",
              view === opt.value
                ? "bg-foreground text-background"
                : "text-foreground/60 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </header>
  );
}
