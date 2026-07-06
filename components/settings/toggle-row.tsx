"use client";

import { useId, type ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  description?: string;
  icon?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
};

/** Notification card: `.tint-card` with icon + switch on top, label + caption below.
 *  Matches the Units-and-locale card grammar (spec: 2x2 grid). 44px switch hit-slop. */
export function ToggleRow({ label, description, icon, checked, onChange, className }: Props) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn("tint-card flex flex-col gap-4 p-5 backdrop-blur", className)}>
      <div className="flex items-center justify-between gap-4">
        <span aria-hidden="true" className="text-foreground/80">
          {icon}
        </span>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          aria-describedby={descriptionId}
          aria-label={label}
          className="shrink-0 after:-inset-x-3.5 after:-inset-y-3.5"
        />
      </div>
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="block cursor-pointer text-[0.9375rem] font-semibold leading-normal text-foreground"
        >
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="caption mt-0.5">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
