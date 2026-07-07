"use client";

import { Bell, CloudRain, Thermometer, Wind } from "lucide-react";
import type { Forecast, TempUnit, WindUnit } from "@/lib/api/types";
import { formatTemp, tempUnitLabel, windUnitLabel } from "@/lib/format";
import { deriveAlerts } from "@/lib/api/alerts";

type Props = {
  forecast: Forecast;
  units: { temperature: TempUnit; wind: WindUnit };
};

export function SummaryCards({ forecast, units }: Props) {
  const days = forecast.daily.length;
  const rainTotal = forecast.daily.reduce((sum, d) => sum + d.precipitationSum, 0);
  const wettest = forecast.daily.reduce((max, d) => (d.precipitationSum > max.precipitationSum ? d : max), forecast.daily[0]);
  const peakWind = forecast.daily.reduce((max, d) => Math.max(max, d.windSpeedMax), 0);
  const peakWindDay = forecast.daily.find((d) => d.windSpeedMax === peakWind);
  const lowest = Math.min(...forecast.daily.map((d) => d.tempMin));
  const highest = Math.max(...forecast.daily.map((d) => d.tempMax));
  const coldestDay = forecast.daily.find((d) => d.tempMin === lowest);
  const alerts = deriveAlerts(forecast);

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Rain total"
        icon={<CloudRain className="size-4" strokeWidth={1.5} aria-hidden="true" />}
        value={Math.round(rainTotal)}
        unit="mm"
      >
        {rainTotal > 0 && wettest.precipitationSum > 0
          ? `Cumulative over ${days} days, heaviest on ${weekdayLong(wettest.date)}.`
          : `No measurable rain expected over the next ${days} days.`}
      </SummaryCard>
      <SummaryCard
        label="Peak wind"
        icon={<Wind className="size-4" strokeWidth={1.5} aria-hidden="true" />}
        value={Math.round(peakWind)}
        unit={windUnitLabel(units.wind)}
      >
        {peakWindDay
          ? `Strongest on ${weekdayLong(peakWindDay.date)}.`
          : "Light winds throughout."}
      </SummaryCard>
      <SummaryCard
        label="Range"
        icon={<Thermometer className="size-4" strokeWidth={1.5} aria-hidden="true" />}
        value={`${formatTemp(lowest, units.temperature, false)}-${formatTemp(highest, units.temperature, false)}`}
        unit={`°${tempUnitLabel(units.temperature)}`}
      >
        {coldestDay
          ? `Coolest night on ${weekdayLong(coldestDay.date)}.`
          : `Across the ${days}-day window.`}
      </SummaryCard>
      <SummaryCard
        label="Alerts"
        icon={<Bell className="size-4" strokeWidth={1.5} aria-hidden="true" />}
        value={alerts.length || "0"}
        unit={alerts.length > 0 ? "active" : "all clear"}
        accent={alerts.length > 0}
      >
        {alerts[0]?.title ?? "No advisories issued for this period."}
      </SummaryCard>
    </div>
  );
}

function weekdayLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long" });
}

function SummaryCard({
  label,
  icon,
  value,
  unit,
  accent,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  unit?: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col p-5 md:border-l md:border-white/12 md:pl-6" data-animate="">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <h3 className="card-subtitle-caps">{label}</h3>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-value text-3xl">{value}</span>
        {unit ? (
          <span
            className={
              accent
                ? "text-xs font-semibold text-[color:var(--palette-accent,var(--accent))]"
                : "caption"
            }
          >
            {unit}
          </span>
        ) : null}
      </div>
      <p className="caption mt-3">{children}</p>
    </div>
  );
}
