"use client";

import { GreetingHeader } from "@/components/today/greeting-header";
import { CurrentConditions } from "@/components/today/current-conditions";
import { UvIndexCard } from "@/components/today/detail-cards/uv-index-card";
import { SunriseCard, SunsetCard } from "@/components/today/detail-cards/sunrise-sunset-card";
import { HumidityCard } from "@/components/today/detail-cards/humidity-card";
import { AirQualityCard } from "@/components/today/detail-cards/air-quality-card";
import { useActiveForecast } from "@/components/shell/active-forecast-context";
import { usePrefs } from "@/hooks/use-prefs";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeToday } from "@/lib/forecast-summary";

/** Today section of the single-page scroll. Owns the page's only <h1>. */
export function TodaySection() {
  const { data, airQuality, loading, error, place, hydrated } = useActiveForecast();
  const [prefs] = usePrefs();

  if (!hydrated) return <TodaySkeleton />;
  if (!place) return null; // empty state handled once by <AppSections/>
  if (loading && !data) return <TodaySkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!data) return <TodaySkeleton />;

  const today = data.daily[0];
  const format12h = prefs.timeFormat === "12h";

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:mx-auto md:my-auto lg:grid-cols-5">
        <div className="flex w-full flex-col gap-6 lg:col-span-3">
          <GreetingHeader timezone={data.place.timezone} summary={summarizeToday(data)} />
          <hr className="border-[var(--hairline)]" />
          <CurrentConditions forecast={data} place={place} units={prefs.units} />
        </div>

        {/* Detail rail. This was a snap-scroll carousel below sm, which at 320px
            showed one of four cards through a scroller whose bar was hidden, so
            nothing indicated the rest existed. These are comparable readings, so
            they are a grid at every width: two up on phones, one up from lg. */}
        <aside aria-label="Today's details" className="w-full lg:col-span-2 lg:mt-8">
          <ul
            role="list"
            className="grid list-none grid-cols-2 content-start gap-3 sm:gap-6"
          >
            {/* The two dial cards run full width and stack: at half width the
                dial drops below a two-line title, where a full-width card is
                wide enough to set them side by side and stay compact. Sunrise
                and sunset pair below, humidity closes the rail. */}
            {airQuality ? (
              <li className="col-span-2 min-w-0">
                <AirQualityCard usAqi={airQuality.usAqi} />
              </li>
            ) : null}
            <li className="col-span-2 min-w-0">
              <UvIndexCard uv={data.current.uvIndex} isDay={data.current.isDay} />
            </li>
            <li className="min-w-0">
              <SunriseCard sunriseIso={today.sunrise} sunsetIso={today.sunset} format12h={format12h} timezone={data.place.timezone} />
            </li>
            <li className="min-w-0">
              <SunsetCard sunriseIso={today.sunrise} sunsetIso={today.sunset} format12h={format12h} timezone={data.place.timezone} />
            </li>
            <li className="col-span-2 min-w-0">
              <HumidityCard current={data.current} unit={prefs.units.temperature} />
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

/** Shape-matched to the real Today layout: hero column (greeting + big icon/temp
 *  + stat rows) spanning 2/3, and the 4-card detail rail in the last column. */
function TodaySkeleton() {
  return (
    <div aria-busy="true" className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Hero column */}
        <div className="grid content-start gap-8 lg:col-span-3">
          <div className="mt-8 space-y-3 text-center lg:text-left">
            <Skeleton aria-hidden="true" className="mx-auto h-10 w-64 max-w-full rounded-2xl lg:mx-0" />
            <Skeleton aria-hidden="true" className="mx-auto h-5 w-80 max-w-full rounded-lg lg:mx-0" />
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-6 py-4 sm:gap-10 lg:justify-start">
              <Skeleton aria-hidden="true" className="size-28 shrink-0 rounded-full sm:size-[180px]" />
              <Skeleton aria-hidden="true" className="h-16 w-40 rounded-3xl sm:h-24 sm:w-56" />
            </div>
            <div className="flex flex-wrap justify-center gap-6 lg:justify-start">
              <Skeleton aria-hidden="true" className="h-14 w-56 max-w-full rounded-2xl" />
              <Skeleton aria-hidden="true" className="h-14 w-44 max-w-full rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Detail rail: 2-up on phones and sm, stacked on lg. Mirrors the real
            grid so the layout does not shift when the data lands. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:col-span-2 lg:mt-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              aria-hidden="true"
              className={`h-[132px] rounded-2xl ${i === 0 ? "col-span-2 lg:col-span-1" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="tint-card mx-auto max-w-md p-8 text-center">
      <h1 className="text-lg font-semibold">Couldn&apos;t load forecast</h1>
      <p className="caption mt-2">{message}</p>
    </div>
  );
}
