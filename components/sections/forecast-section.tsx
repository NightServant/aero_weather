"use client";

import { SectionHeader } from "./section-header";
import { MarqueeView } from "@/components/forecast/marquee-view";
import { HourlyView } from "@/components/forecast/hourly-view";
import { SummaryCards } from "@/components/forecast/summary-cards";
import { useActiveForecast } from "@/components/shell/active-forecast-context";
import { usePrefs } from "@/hooks/use-prefs";
import { summarizeOutlook } from "@/components/forecast/outlook-summary";
import { Skeleton } from "@/components/ui/skeleton";

/** 2-Week section: no tab switcher (purer scroll) — hourly rail + 14-day grid + summary. */
export function ForecastSection() {
  const { data, loading, error, hydrated, place } = useActiveForecast();
  const [prefs] = usePrefs();

  if (!hydrated || (loading && !data)) return <ForecastSkeleton />;
  if (!place) return null; // empty state handled once by <AppSections/>
  if (error || !data) return null;

  const { title, subtitle } = summarizeOutlook(data);

  return (
    <div className="space-y-8">
      <SectionHeader id="forecast-h" kicker="2-week outlook" title={title} subtitle={subtitle} />
      <SummaryCards forecast={data} units={prefs.units} />
      
      <div className="space-y-3">
        <p className="card-subtitle-caps">14-day forecast</p>
        <MarqueeView daily={data.daily} current={data.current} unit={prefs.units.temperature} timezone={data.place.timezone} />
      </div>

      <div className="space-y-3">
        <p className="card-subtitle-caps">Next 24 hours</p>
        <HourlyView forecast={data} units={prefs.units} format12h={prefs.timeFormat === "12h"} />
      </div>
    </div>
  );
}

function ForecastSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8">
      <Skeleton aria-hidden="true" className="h-32 w-full rounded-3xl" />
      <Skeleton aria-hidden="true" className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} aria-hidden="true" className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
