"use client";

import { GlassCard } from "@/components/aero/glass-card";
import { PillTabs } from "@/components/aero/pill-tabs";

export type ForecastView = "hourly" | "daily" | "grid";

type Props = {
  title: string;
  subtitle: string;
  days: number;
  view: ForecastView;
  onChangeView: (v: ForecastView) => void;
};

const TABS: { value: ForecastView; label: string }[] = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "grid", label: "Grid" },
];

/** Figma header: kicker card left, Hourly/Daily/Grid tabs right, blue headline card below. */
export function ForecastHeader({ title, subtitle, days, view, onChangeView }: Props) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <GlassCard variant="glass" className="stagger-1 px-5 py-4">
          <p className="kicker">2-Week Outlook</p>
          <p className="caption mt-0.5">{days} days of forecast</p>
        </GlassCard>
        <PillTabs
          tabs={TABS as { value: string; label: string }[]}
          value={view}
          onValueChange={(v) => onChangeView(v as ForecastView)}
          ariaLabel="Forecast view"
          panelIdPrefix="forecast-view"
          className="stagger-2"
        />
      </div>

      <GlassCard variant="glass" className="stagger-3 px-8 py-8">
        <h1 className="text-headline">{title}</h1>
        <p className="text-subtitle mt-2">{subtitle}</p>
      </GlassCard>
    </>
  );
}
