"use client";

import { useCallback, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Droplet } from "lucide-react";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { formatShortDate, formatTemp, tempUnitLabel } from "@/lib/format";
import { dayLabel, showsPrecip } from "@/lib/daily-outlook";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import type { CurrentConditions, DailyPoint, TempUnit } from "@/lib/api/types";

type Props = {
  daily: DailyPoint[];
  unit: TempUnit;
  timezone?: string;
  /** Live conditions for the "Today" entry, so it never contradicts the hero. */
  current?: CurrentConditions;
};

/**
 * The 14-day outlook, in the axis that suits the pointer.
 *
 * Reading this list is a comparison task ("which day is warmest", "when does
 * the rain stop"), which needs several days visible at once. On a phone the
 * scarce axis is width, so days stack as full-width rows and seven or more fit
 * on screen; a horizontal rail there showed one 256px card at a time inside a
 * vertically scrolling page, with no way to pause it on touch.
 *
 * From `lg` up there is room for a row of cards and a pointer to drive them, so
 * the same data becomes a carousel the reader controls. Both layouts render;
 * CSS picks one, which keeps the choice out of hydration.
 */
export function DailyOutlook({ daily, unit, timezone, current }: Props) {
  return (
    <>
      <DailyList daily={daily} unit={unit} timezone={timezone} current={current} />
      <DailyCarousel daily={daily} unit={unit} timezone={timezone} current={current} />
    </>
  );
}

function dayVisual(point: DailyPoint, index: number, current?: CurrentConditions) {
  const kind = weatherCodeToKind(
    index === 0 && current ? current.weatherCode : point.weatherCode,
  );
  const isDay = index === 0 && current ? current.isDay : true;
  return { kind, isDay };
}

function TempPair({
  point,
  unit,
  className = "",
}: {
  point: DailyPoint;
  unit: TempUnit;
  className?: string;
}) {
  const unitLabel = tempUnitLabel(unit);
  return (
    <p
      className={`tabular whitespace-nowrap ${className}`}
      aria-label={`High ${formatTemp(point.tempMax, unit)} degrees, low ${formatTemp(point.tempMin, unit)} degrees`}
    >
      <span className="font-semibold text-text-strong">
        {formatTemp(point.tempMax, unit)}
        {unitLabel}
      </span>{" "}
      <span className="text-muted-foreground">
        {formatTemp(point.tempMin, unit)}
        {unitLabel}
      </span>
    </p>
  );
}

function PrecipChance({ probability }: { probability: number }) {
  return (
    <span className="tabular inline-flex items-center gap-1 text-[0.8125rem] text-accent-droplet">
      <Droplet className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
      {Math.round(probability)}%
    </span>
  );
}

/** Mobile and tablet: one day per row, hairline separated, no nested scroller. */
function DailyList({ daily, unit, timezone, current }: Props) {
  return (
    <ul className="lg:hidden" aria-label="14-day forecast">
      {daily.map((point, i) => {
        const { kind, isDay } = dayVisual(point, i, current);
        const precip = point.precipitationProbabilityMax;
        return (
          <li
            key={point.date}
            className="grid grid-cols-[3.5rem_auto_1fr_auto] items-center gap-3 border-b border-white/[0.07] py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-strong">
                {dayLabel(i, point.date, timezone)}
              </p>
              <p className="caption">{formatShortDate(point.date, timezone)}</p>
            </div>

            <AnimatedWeatherIcon kind={kind} isDay={isDay} size={30} animated={false} />

            <div className="min-w-0">
              <p className="truncate text-[0.8125rem] text-foreground/85">
                {WEATHER_LABEL[kind]}
              </p>
              {showsPrecip(precip) ? <PrecipChance probability={precip} /> : null}
            </div>

            <TempPair point={point} unit={unit} className="text-sm" />
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop: reader-driven carousel, replacing the old auto-scrolling marquee. */
function DailyCarousel({ daily, unit, timezone, current }: Props) {
  const [viewportRef, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

  // Read embla's reachability straight from the instance rather than mirroring
  // it into state from an effect, which cascades a render on every select.
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!api) return () => {};
      api.on("select", onChange);
      api.on("reInit", onChange);
      return () => {
        api.off("select", onChange);
        api.off("reInit", onChange);
      };
    },
    [api],
  );
  const canPrev = useSyncExternalStore(
    subscribe,
    () => api?.canScrollPrev() ?? false,
    () => false,
  );
  const canNext = useSyncExternalStore(
    subscribe,
    () => api?.canScrollNext() ?? false,
    () => false,
  );

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="14-day forecast"
      className="hidden items-center gap-4 lg:flex"
    >
      <IconCircleButton
        icon={<ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Previous days"
        size={48}
        disabled={!canPrev}
        onClick={() => api?.scrollPrev()}
      />

      <div ref={viewportRef} className="min-w-0 flex-1 overflow-hidden">
        <ul className="-ml-4 flex">
          {daily.map((point, i) => {
            const { kind, isDay } = dayVisual(point, i, current);
            const precip = point.precipitationProbabilityMax;
            return (
              <li
                key={point.date}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${daily.length}`}
                className="min-w-0 shrink-0 grow-0 basis-[15rem] pl-4"
              >
                <div className="tint-card flex h-full items-center gap-4 p-4 backdrop-blur">
                  <AnimatedWeatherIcon kind={kind} isDay={isDay} size={48} />
                  <div className="min-w-0">
                    <h3 className="stat-title leading-tight">
                      {dayLabel(i, point.date, timezone)}
                    </h3>
                    <p className="caption truncate">
                      {formatShortDate(point.date, timezone)} - {WEATHER_LABEL[kind]}
                    </p>
                    <TempPair point={point} unit={unit} className="mt-1 text-sm" />
                    {showsPrecip(precip) ? <PrecipChance probability={precip} /> : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <IconCircleButton
        icon={<ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        label="Next days"
        size={48}
        disabled={!canNext}
        onClick={() => api?.scrollNext()}
      />
    </div>
  );
}
