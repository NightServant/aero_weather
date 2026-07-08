"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MapPin, Mountain, Clock, Sunrise, Sunset, Eye, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CityPhoto } from "./city-photo";
import { LocationGallery } from "./location-gallery";
import { AnimatedWeatherIcon } from "@/components/icons/animated-weather-icon";
import { getCityDescription } from "@/lib/api/city-details";
import { weatherCodeToKind, WEATHER_LABEL } from "@/lib/api/weather-code";
import { formatTemp, tempUnitLabel, formatTime } from "@/lib/format";
import type { Forecast, Place, UnitPrefs } from "@/lib/api/types";

const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => <div aria-busy="true" className="h-56 w-full animate-pulse rounded-xl bg-white/10 sm:h-64" />,
});

export type DetailsMode = "saved" | "suggested";

type Props = {
  place: Place | null;
  mode: DetailsMode;
  forecast: Forecast | null | undefined;
  units: UnitPrefs;
  format12h: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewForecast?: (place: Place) => void;
  onRemove?: (place: Place) => void;
  onSave?: (place: Place) => void;
};

export function LocationDetailsDialog({
  place, mode, forecast, units, format12h, open, onOpenChange,
  onViewForecast, onRemove, onSave,
}: Props) {
  const [description, setDescription] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!open || !place) return;
    let cancelled = false;
    setDescription(undefined);
    getCityDescription(place).then((d) => {
      if (!cancelled) setDescription(d);
    });
    return () => {
      cancelled = true;
    };
  }, [open, place]);

  if (!place) return null;

  const kind = forecast ? weatherCodeToKind(forecast.current.weatherCode) : null;
  const region = [place.admin1, place.country].filter(Boolean).join(", ") || place.countryCode;
  const today = forecast?.daily[0];
  const tz = place.timezone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden border-white/12 p-0 sm:max-w-3xl"
        style={{ background: "oklch(0.17 0.02 245 / 0.96)" }}
      >
        <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
          {/* Header */}
          <DialogHeader className="relative gap-0 p-0">
            <div className="relative h-40 w-full sm:h-48">
              <CityPhoto place={place} width={768} height={192} className="h-full w-full rounded-none" initialClassName="text-7xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-3 left-4 right-4">
                <DialogTitle className="text-xl font-semibold text-white">{place.name}</DialogTitle>
                <DialogDescription className="text-sm text-white/80">{region}</DialogDescription>
              </div>
              {kind ? (
                <span className="glass-pill absolute top-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-foreground">
                  <AnimatedWeatherIcon kind={kind} isDay={forecast?.current.isDay ?? true} size={16} />
                  {forecast ? `${formatTemp(forecast.current.temperature, units.temperature)}${tempUnitLabel(units.temperature)}` : "--"}
                  <span className="text-foreground/70">· {WEATHER_LABEL[kind]}</span>
                </span>
              ) : null}
            </div>
          </DialogHeader>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-5">
              <section>
                <h4 className="card-subtitle-caps mb-2">Overview</h4>
                {description === undefined ? (
                  <div aria-busy="true" className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-11/12 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {description
                      ? summarize(description)
                      : `${place.name} is one of your tracked locations. A description isn't available yet.`}
                  </p>
                )}
              </section>
              <section>
                <h4 className="card-subtitle-caps mb-2">Photos</h4>
                <LocationGallery place={place} />
              </section>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <section>
                <h4 className="card-subtitle-caps mb-2">Map</h4>
                <LocationMap lat={place.latitude} lon={place.longitude} name={place.name} />
              </section>
              <section>
                <h4 className="card-subtitle-caps mb-2">Details</h4>
                <dl className="grid grid-cols-2 gap-3">
                  <Meta icon={<MapPin className="size-3.5" strokeWidth={1.5} />} label="Coordinates" value={`${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)}`} />
                  <Meta icon={<Mountain className="size-3.5" strokeWidth={1.5} />} label="Elevation" value={forecast?.elevation != null ? `${Math.round(forecast.elevation)} m` : "—"} />
                  <Meta icon={<Clock className="size-3.5" strokeWidth={1.5} />} label="Time zone" value={tz} />
                  <Meta icon={<Sunrise className="size-3.5" strokeWidth={1.5} />} label="Sunrise" value={today ? formatTime(today.sunrise, format12h, tz) : "—"} />
                  <Meta icon={<Sunset className="size-3.5" strokeWidth={1.5} />} label="Sunset" value={today ? formatTime(today.sunset, format12h, tz) : "—"} />
                </dl>
              </section>
            </div>
          </div>
        </div>

        {/* Sticky footer actions */}
        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-white/12 bg-[oklch(0.2_0.025_245_/_0.85)] p-4 backdrop-blur sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          {mode === "saved" ? (
            <>
              <Button variant="ghost" className="text-destructive" onClick={() => { onRemove?.(place); onOpenChange(false); }}>
                <Trash2 className="size-4" strokeWidth={1.5} /> Remove
              </Button>
              <Button onClick={() => { onViewForecast?.(place); onOpenChange(false); }}>
                <Eye className="size-4" strokeWidth={1.5} /> View forecast
              </Button>
            </>
          ) : (
            <Button onClick={() => { onSave?.(place); onOpenChange(false); }}>Save location</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Trim a long extract to its essential lead: whole sentences up to ~220 chars,
 *  falling back to a word-boundary cut with an ellipsis. */
function summarize(text: string, maxChars = 220): string {
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;
  const slice = clean.slice(0, maxChars);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastStop >= 80) return slice.slice(0, lastStop + 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : maxChars).trimEnd()}…`;
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="card-subtitle-caps">{label}</span>
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
