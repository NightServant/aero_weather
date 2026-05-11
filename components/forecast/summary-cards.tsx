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
  const rainTotal = forecast.daily.reduce((sum, d) => sum + d.precipitationSum, 0);
  const peakWind = forecast.daily.reduce((max, d) => Math.max(max, d.windSpeedMax), 0);
  const peakWindDay = forecast.daily.find((d) => d.windSpeedMax === peakWind);
  const lowest = Math.min(...forecast.daily.map((d) => d.tempMin));
  const highest = Math.max(...forecast.daily.map((d) => d.tempMax));
  const alerts = deriveAlerts(forecast);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Rain total" icon={<CloudRain className="size-3.5" strokeWidth={1.5} />} value={Math.round(rainTotal)} unit="mm">
        Cumulative over the next 7 days, mostly midweek.
      </SummaryCard>
      <SummaryCard label="Peak wind" icon={<Wind className="size-3.5" strokeWidth={1.5} />} value={Math.round(peakWind)} unit={windUnitLabel(units.wind)}>
        {peakWindDay
          ? `Gusts expected on ${new Date(peakWindDay.date).toLocaleDateString("en-US", { weekday: "long" })}.`
          : "Light winds throughout the week."}
      </SummaryCard>
      <SummaryCard
        label="Range"
        icon={<Thermometer className="size-3.5" strokeWidth={1.5} />}
        value={`${formatTemp(lowest, units.temperature, false)}–${formatTemp(highest, units.temperature, false)}`}
        unit={`°${tempUnitLabel(units.temperature)}`}
      >
        Coolest nights early in the week, warmest afternoon by the weekend.
      </SummaryCard>
      <SummaryCard
        label="Alerts"
        icon={<Bell className="size-3.5" strokeWidth={1.5} />}
        value={alerts.length || "0"}
        unit={alerts.length === 1 ? "active" : alerts.length > 1 ? "active" : "all clear"}
        accent={alerts.length > 0}
      >
        {alerts[0]?.title ?? "No advisories issued for the week."}
      </SummaryCard>
    </div>
  );
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
    <div className="surface-card flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="eyebrow">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tabular text-foreground">{value}</span>
        {unit ? <span className={accent ? "text-xs font-semibold text-[color:var(--palette-accent,var(--accent))]" : "text-xs text-muted-foreground"}>{unit}</span> : null}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
