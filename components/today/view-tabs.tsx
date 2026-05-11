"use client";

import { cn } from "@/lib/utils";

export type TodayView = "today" | "tomorrow";

type Props = {
  value: TodayView;
  onChange: (v: TodayView) => void;
};

const OPTIONS: { value: TodayView; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
];

export function ViewTabs({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-full border border-[var(--hairline)] bg-card p-1 text-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full px-4 py-1.5 font-medium transition-colors",
            value === opt.value
              ? "bg-foreground text-background"
              : "text-foreground/60 hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
