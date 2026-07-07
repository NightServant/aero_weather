"use client";

import type { ReactNode } from "react";
import { Calendar, Clock, Thermometer, Wind, type LucideIcon } from "lucide-react";
import { TagToggleGroup } from "@/components/aero/tag-toggle-group";
import { usePrefs } from "@/hooks/use-prefs";
import type { TempUnit, WindUnit } from "@/lib/api/types";
import type { FirstDayOfWeek, TimeFormat } from "@/lib/prefs";
import { cn } from "@/lib/utils";

type PrefCardProps = {
  icon: LucideIcon;
  label: string;
  caption: string;
  className?: string;
  children: ReactNode;
};

/** One preference group (Figma settings card anatomy: icon 40px, chips, label, caption). */
function PrefCard({ icon: Icon, label, caption, className, children }: PrefCardProps) {
  return (
    <section className={cn("flex flex-col gap-4 p-5 md:border-l md:border-white/12", className)}>
      <div className="flex items-center justify-between gap-3">
        <Icon aria-hidden="true" className="size-10 shrink-0 text-foreground/80" strokeWidth={1.5} />
        <div className="flex min-w-0 flex-1 justify-end">{children}</div>
      </div>
      <div className="space-y-1">
        <h3 className="text-[0.9375rem] font-semibold leading-normal text-foreground">{label}</h3>
        <p className="caption">{caption}</p>
      </div>
    </section>
  );
}

export function UnitsLocaleSection() {
  const [prefs, setPrefs] = usePrefs();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <h2 className="sr-only">Units and locale</h2>

      <PrefCard
        icon={Thermometer}
        label="Temperature"
        caption="Celsius or Fahrenheit"
        className="stagger-1"
      >
        <TagToggleGroup
          ariaLabel="Temperature"
          options={[
            { value: "celsius", label: "°C" },
            { value: "fahrenheit", label: "°F" },
          ]}
          value={prefs.units.temperature}
          onValueChange={(v) =>
            setPrefs((p) => ({ ...p, units: { ...p.units, temperature: v as TempUnit } }))
          }
        />
      </PrefCard>

      <PrefCard
        icon={Wind}
        label="Wind speed"
        caption="Used across all forecast"
        className="stagger-2"
      >
        <TagToggleGroup
          ariaLabel="Wind speed"
          options={[
            { value: "kmh", label: "km/h" },
            { value: "mph", label: "mph" },
            { value: "ms", label: "m/s" },
          ]}
          value={prefs.units.wind}
          onValueChange={(v) =>
            setPrefs((p) => ({ ...p, units: { ...p.units, wind: v as WindUnit } }))
          }
        />
      </PrefCard>

      <PrefCard
        icon={Clock}
        label="Time Format"
        caption="Affects hourly & sunrise/sunset."
        className="stagger-3"
      >
        <TagToggleGroup
          ariaLabel="Time Format"
          options={[
            { value: "12h", label: "12h" },
            { value: "24h", label: "24h" },
          ]}
          value={prefs.timeFormat}
          onValueChange={(v) => setPrefs((p) => ({ ...p, timeFormat: v as TimeFormat }))}
        />
      </PrefCard>

      <PrefCard
        icon={Calendar}
        label="First day of the week"
        caption="Used for daily view."
        className="stagger-4"
      >
        <TagToggleGroup
          ariaLabel="First day of the week"
          options={[
            { value: "sun", label: "Sun" },
            { value: "mon", label: "Mon" },
          ]}
          value={prefs.firstDayOfWeek}
          onValueChange={(v) =>
            setPrefs((p) => ({ ...p, firstDayOfWeek: v as FirstDayOfWeek }))
          }
        />
      </PrefCard>
    </div>
  );
}
