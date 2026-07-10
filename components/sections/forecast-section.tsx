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

/** Shape-matched to the real 2-Week layout: text header, 4 summary columns,
 *  the 14-day marquee row, then the 24-hour rail. */
function ForecastSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8">
      {/* Section header (kicker + title + subtitle) */}
      <div className="space-y-3 pt-8">
        <Skeleton aria-hidden="true" className="h-4 w-32 rounded" />
        <Skeleton aria-hidden="true" className="h-9 w-72 max-w-full rounded-2xl" />
        <Skeleton aria-hidden="true" className="h-5 w-96 max-w-full rounded-lg" />
      </div>

      {/* Summary columns */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 p-5">
            <Skeleton aria-hidden="true" className="h-4 w-24 rounded" />
            <Skeleton aria-hidden="true" className="h-8 w-20 rounded-lg" />
            <Skeleton aria-hidden="true" className="h-3.5 w-full max-w-[12rem] rounded" />
          </div>
        ))}
      </div>

      {/* 14-day forecast marquee */}
      <div className="space-y-3">
        <Skeleton aria-hidden="true" className="h-3 w-28 rounded" />
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} aria-hidden="true" className="h-[92px] w-64 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Next 24 hours */}
      <div className="space-y-3">
        <Skeleton aria-hidden="true" className="h-3 w-28 rounded" />
        <div className="flex gap-2 overflow-hidden p-3">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} aria-hidden="true" className="h-[104px] w-[74px] shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
