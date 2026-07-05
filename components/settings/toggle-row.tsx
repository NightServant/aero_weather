"use client";

import { useId } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
};

/** Notifications toggle row: `.tint-card` shell, 44px switch touch target (spec 7). */
export function ToggleRow({ label, description, checked, onChange, className }: Props) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div
      className={cn(
        "tint-card flex min-h-[44px] items-center justify-between gap-4 px-5 py-4",
        className,
      )}
    >
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
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-describedby={descriptionId}
        className="shrink-0 after:-inset-x-3.5 after:-inset-y-3.5"
      />
    </div>
  );
}
