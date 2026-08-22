"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MapPin, Mountain, Clock, Sunrise, Sunset, Eye, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
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
  loading: () => <div aria-busy="true" className="absolute inset-0 animate-pulse bg-white/10" />,
});

/** True from the `lg` breakpoint up, so the satellite map only mounts on desktop
 *  (it stays hidden on mobile screens). */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const isMobile = useMediaQuery("(max-width: 767px)");

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

  // A sheet that rises from the edge the thumb is nearest reads as native on a
  // phone, and Vaul gives it drag-to-dismiss. From md up the same content is a
  // centred dialog, where a bottom sheet would be an odd import from mobile.
  // Both are Radix dialogs underneath but expose different primitives, so the
  // body is built once and handed whichever set is in play.
  const Close = isMobile ? DrawerClose : DialogClose;
  const Header = isMobile ? DrawerHeader : DialogHeader;
  const Title = isMobile ? DrawerTitle : DialogTitle;
  const Description = isMobile ? DrawerDescription : DialogDescription;

  // One height cap per surface. Below md the drawer owns it and this fills what
  // the drawer allows (`min-h-0 flex-1`, so the scrolling body can shrink and
  // the footer always has its row); from md the dialog is a grid, where those
  // two are inert and the cap here is what bounds it.
  const inner = (
        <div className="relative flex min-h-0 flex-1 flex-col md:max-h-[88dvh]">
          {/* Single close control, pinned to the dialog's top-right: it sits over the
              map on desktop and over the header photo on mobile (where the map is hidden). */}
          <Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute top-3 right-3 z-[1000] grid size-9 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/30 backdrop-blur-md transition-colors duration-150 hover:bg-black/65 focus-visible:bg-black/65"
            >
              <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </Close>

          {/* Body: scrolls as a unit on mobile; on desktop the info column scrolls on
              its own (2/5) beside the full-height map (3/5). */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:flex lg:flex-col lg:overflow-hidden">
            <div className="grid lg:min-h-0 lg:flex-1 lg:grid-cols-[2fr_3fr] lg:grid-rows-1">
              {/* Info column (2/5): header photo flush on top, then padded content. */}
              <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border-r lg:border-white/12 [scrollbar-width:thin]">
                <Header className="relative gap-0 p-0">
                  <div className="relative h-40 w-full sm:h-48">
                    <CityPhoto place={place} width={768} height={192} className="h-full w-full rounded-none" initialClassName="text-7xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
                    <div className="absolute bottom-3 left-5 right-5">
                      <Title className="text-2xl font-semibold text-white">{place.name}</Title>
                      <Description className="mt-0.5 text-sm text-white/75">{region}</Description>
                    </div>
                    {kind ? (
                      <span className="absolute top-3 left-5 inline-flex items-center gap-2 rounded-full bg-black/50 py-1.5 pr-3.5 pl-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-md">
                        <AnimatedWeatherIcon kind={kind} isDay={forecast?.current.isDay ?? true} size={18} />
                        <span className="tabular-nums">
                          {forecast ? `${formatTemp(forecast.current.temperature, units.temperature)}${tempUnitLabel(units.temperature)}` : "--"}
                        </span>
                        <span className="font-normal text-white/70">· {WEATHER_LABEL[kind]}</span>
                      </span>
                    ) : null}
                  </div>
                </Header>

                <div className="space-y-6 p-6">
                  <section>
                    <h4 className="card-subtitle-caps mb-2">Overview</h4>
                    {description === undefined ? (
                      <div aria-busy="true" className="space-y-2">
                        <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                        <div className="h-3 w-11/12 animate-pulse rounded bg-white/10" />
                        <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-text-mid">
                        {description
                          ? summarize(description)
                          : `${place.name} is one of your tracked locations. A description isn't available yet.`}
                      </p>
                    )}
                  </section>

                  <section>
                    <h4 className="card-subtitle-caps mb-2">Photos</h4>
                    <LocationGallery place={place} onLightboxOpenChange={setLightboxOpen} />
                  </section>

                  <section>
                    <h4 className="card-subtitle-caps mb-2">Details</h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <Meta icon={<MapPin className="size-3.5" strokeWidth={1.5} />} label="Coordinates" value={`${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)}`} />
                      <Meta icon={<Mountain className="size-3.5" strokeWidth={1.5} />} label="Elevation" value={forecast?.elevation != null ? `${Math.round(forecast.elevation)} m` : "—"} />
                      <Meta icon={<Clock className="size-3.5" strokeWidth={1.5} />} label="Time zone" value={tz} />
                      <Meta icon={<Sunrise className="size-3.5" strokeWidth={1.5} />} label="Sunrise" value={today ? formatTime(today.sunrise, format12h, tz) : "—"} />
                      <Meta icon={<Sunset className="size-3.5" strokeWidth={1.5} />} label="Sunset" value={today ? formatTime(today.sunset, format12h, tz) : "—"} />
                    </dl>
                  </section>
                </div>
              </div>

              {/* Satellite map (3/5) — desktop only, full-bleed, no border radius */}
              {isDesktop ? (
                <div className="relative hidden min-h-[320px] bg-white/[0.04] lg:block">
                  <LocationMap lat={place.latitude} lon={place.longitude} name={place.name} />
                </div>
              ) : null}
            </div>
          </div>

          {/* Fixed footer actions. The extra bottom padding below `sm` is for
              the browser's own furniture: Brave and Chrome on Android park a
              navigation bar along the bottom edge, and a button flush against
              the sheet's last pixel reads as sitting underneath it even when
              it is not. `env(safe-area-inset-bottom)` adds the home indicator
              on top of that where the page opts into it, and resolves to 0
              everywhere else. */}
          <div className="flex flex-col-reverse gap-2 border-t border-white/12 bg-[oklch(0.2_0.025_245_/_0.85)] p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] backdrop-blur sm:flex-row sm:justify-end sm:pb-4">
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
        </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {/* The height has to be set through the same data-variant the drawer
            ships with, `data-[vaul-drawer-direction=bottom]:max-h-[80vh]`: a
            plain `max-h-*` utility loses to it on specificity, so the previous
            `max-h-[92vh]` here never applied and the sheet was 80vh. And dvh,
            not vh, because `100vh` on Android is the viewport with the browser
            chrome retracted, which is taller than what is actually on screen. */}
        <DrawerContent
          aria-label={place.name}
          className="border-white/12 p-0 data-[vaul-drawer-direction=bottom]:max-h-[90dvh]"
        >
          {inner}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden border-white/12 p-0 backdrop-blur sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl"
        style={{ background: "oklch(0.2 0.025 245 / 0.77)" }}
        onEscapeKeyDown={(e) => lightboxOpen && e.preventDefault()}
        onInteractOutside={(e) => lightboxOpen && e.preventDefault()}
      >
        {inner}
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
