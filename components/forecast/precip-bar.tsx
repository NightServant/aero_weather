"use client";

import { cn } from "@/lib/utils";

export function PrecipBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]", className)}>
      <div className="precip-bar-gradient h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
