"use client";

import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({ value, options, onChange, className }: Props<T>) {
  return (
    <div className={cn("inline-flex rounded-full border border-[var(--hairline)] bg-background p-0.5 text-xs", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full px-3 py-1.5 font-semibold transition-colors",
            value === opt.value
              ? "bg-[color:var(--palette-accent,var(--accent))] text-white shadow-sm"
              : "text-foreground/55 hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
