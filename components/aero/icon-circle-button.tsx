"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icon: ReactNode;
  /** Accessible name; icon-only buttons must always have one (spec 7). */
  label: string;
  size?: 40 | 48;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">;

/** Round `.glass-pill` icon button: carousel arrows, geolocate pin, hamburger. */
export function IconCircleButton({ icon, label, size = 40, className, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "glass-pill grid shrink-0 place-items-center text-foreground/80 transition-colors duration-150",
        "hover:bg-white/[0.14] hover:text-foreground active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      style={{ width: size, height: size }}
      {...rest}
    >
      {icon}
    </button>
  );
}
