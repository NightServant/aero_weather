"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./settings-section";

const VERSION = "v0.1.0";

const DATA_SOURCES = [
  {
    name: "Open-Meteo · Forecast API",
    url: "https://open-meteo.com/en/docs",
    purpose: "Current conditions, hourly forecasts, and daily summaries.",
  },
  {
    name: "Open-Meteo · Geocoding API",
    url: "https://open-meteo.com/en/docs/geocoding-api",
    purpose: "City search and reverse-geocoding from coordinates.",
  },
  {
    name: "Open-Meteo · Air Quality API",
    url: "https://open-meteo.com/en/docs/air-quality-api",
    purpose: "US AQI and PM2.5 / PM10 / ozone / NO₂ readings.",
  },
];

export function AboutSection() {
  return (
    <SettingsSection
      title="About"
      description="Aero is free for everyone — no account, no subscription. Your settings live on this device only."
    >
      <InfoRow
        title="Version"
        subtitle={`${VERSION} · early access`}
        dialogTitle={`Aero ${VERSION}`}
        dialogDescription="Project status and stack."
      >
        <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
          <p>
            Aero is in early access. The version above tracks <code className="rounded bg-foreground/10 px-1 py-0.5 text-xs">package.json</code>;
            no formal release schedule yet.
          </p>
          <p>
            Built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Radix UI, and
            next-themes. Source weather data comes from Open-Meteo (see Data sources).
          </p>
        </div>
      </InfoRow>

      <InfoRow
        title="Privacy & data"
        subtitle="Local-first. Location precision and telemetry are off by default."
        dialogTitle="Local-first by design"
        dialogDescription="What stays on your device, and what leaves it."
      >
        <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
          <p>
            Aero stores your saved locations, theme, and unit preferences inside your browser's local
            storage. Nothing leaves your device unless you make a forecast request — and those go
            directly to the upstream weather providers listed under Data sources.
          </p>
          <p>
            When you tap the location pin, Aero asks the browser for your approximate coordinates and
            forwards them once to the geocoding service to translate them into a city name. The
            lookup result lives only in your local storage.
          </p>
          <p>Telemetry, ad tracking, and analytics are off. There is no account to delete because there isn't one.</p>
        </div>
      </InfoRow>

      <InfoRow
        title="Data sources"
        subtitle="Powered by Open-Meteo"
        dialogTitle="Where forecasts come from"
        dialogDescription="Aero is a thin reader over public meteorological APIs."
      >
        <div className="divide-y divide-[var(--hairline)]">
          {DATA_SOURCES.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="-mx-2 flex items-start justify-between gap-3 rounded-xl px-3 py-3 first:pt-0 last:pb-0 outline-none transition hover:bg-foreground/[0.04] focus-visible:bg-foreground/[0.04]"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{s.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.purpose}</div>
              </div>
              <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            </a>
          ))}
        </div>
      </InfoRow>
    </SettingsSection>
  );
}

function InfoRow({
  title,
  subtitle,
  dialogTitle,
  dialogDescription,
  children,
}: {
  title: string;
  subtitle: string;
  dialogTitle: string;
  dialogDescription?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-2">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs font-semibold">
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            {dialogDescription ? <DialogDescription>{dialogDescription}</DialogDescription> : null}
          </DialogHeader>
          <div className="mt-2">{children}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
