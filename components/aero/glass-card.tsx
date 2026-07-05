import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** `glass` is the only blurred card; `tint` is the default flat card (spec 2). */
  variant?: "glass" | "tint" | "navbar";
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>;

const VARIANT_CLASS = {
  glass: "glass-card",
  tint: "tint-card",
  navbar: "glass-navbar",
} as const;

export function GlassCard({ variant = "tint", as: Tag = "div", className, children, ...rest }: Props) {
  return (
    <Tag className={cn(VARIANT_CLASS[variant], className)} {...rest}>
      {children}
    </Tag>
  );
}
