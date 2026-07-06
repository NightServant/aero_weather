"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

type Props = {
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
};

/**
 * Settings tag-chip single select (spec 9). Radix ToggleGroup gives roving
 * focus + arrow keys; empty selection is rejected so one option is always on.
 */
export function TagToggleGroup({ options, value, onValueChange, ariaLabel, className }: Props) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
      aria-label={ariaLabel}
      className={cn("flex flex-nowrap items-center gap-1.5", className)}
    >
      {options.map((opt) => (
        <ToggleGroupPrimitive.Item
          key={opt.value}
          value={opt.value}
          className={cn(
            // Compact chip with hit-slop preserved via negative margin (spec 7).
            "-my-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150 active:scale-[0.98]",
            "border-white/[0.14] bg-white/[0.06] text-muted-foreground hover:text-foreground",
            "data-[state=on]:border-primary/60 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
          )}
        >
          {opt.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}
