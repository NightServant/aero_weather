"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
};

export function SidebarNavItem({ href, icon: Icon, label }: Props) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/today" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-white/[0.04] text-white"
          : "text-white/65 hover:text-white hover:bg-white/[0.02]",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-x-3 -translate-y-1/2 rounded-full bg-[var(--palette-accent,oklch(0.65_0.2_255))]"
        />
      ) : null}
      <Icon className="size-4 shrink-0" strokeWidth={1.5} />
      <span className="flex-1">{label}</span>
      {active ? (
        <span className="relative flex size-2 items-center justify-center">
          <span className="absolute size-3 rounded-full bg-[var(--palette-accent,oklch(0.65_0.2_255))] opacity-40" />
          <span className="relative size-1.5 rounded-full bg-[var(--palette-accent,oklch(0.65_0.2_255))]" />
        </span>
      ) : null}
    </Link>
  );
}
