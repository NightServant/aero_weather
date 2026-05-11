"use client";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
};

export function SettingsSection({ title, description, className, children }: Props) {
  return (
    <section className={cn("surface-card flex flex-col gap-5 p-6", className)}>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5 border-t border-[var(--hairline)] pt-5">{children}</div>
    </section>
  );
}

export function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {description ? <div className="mt-0.5 text-xs text-muted-foreground">{description}</div> : null}
      </div>
      <div>{control}</div>
    </div>
  );
}
