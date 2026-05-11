"use client";

import { Switch } from "@/components/ui/switch";

type Props = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

export function ToggleRow({ label, description, checked, onChange }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {description ? <div className="mt-0.5 text-xs text-muted-foreground">{description}</div> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
