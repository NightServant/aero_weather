"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type InfoTopic = "about" | "privacy";

type Props = {
  topic: InfoTopic | null;
  onOpenChange: (open: boolean) => void;
};

const CONTENT: Record<InfoTopic, { title: string; description: string; body: React.ReactNode }> = {
  about: {
    title: "About AeroWeather",
    description: "Local-first weather. Free for everyone, no sign-up.",
    body: (
      <>
        <p>
          AeroWeather is a single-page weather dashboard that runs entirely in your browser. It shows
          current conditions and a two-week outlook for any city in the world, with a dark glassmorphic
          interface and weather-driven gradient palettes.
        </p>
        <p>
          It&apos;s built with Next.js 16 and React 19. Weather, air quality, and geocoding come from
          Open-Meteo&apos;s free, key-less endpoints; place imagery and descriptions come from Wikipedia
          and Wikimedia Commons; maps are rendered with OpenStreetMap.
        </p>
        <p>
          There is no account, no premium tier, and no rate limits surfaced to you — just weather.
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy",
    description: "No accounts, no tracking, no analytics.",
    body: (
      <>
        <p>
          AeroWeather has no backend of its own and collects no personal data. Your preferences — saved
          locations, units, time format, and notification toggles — are stored only in this
          device&apos;s <code className="rounded bg-white/10 px-1 py-0.5 text-[0.8em]">localStorage</code>{" "}
          and never leave your browser.
        </p>
        <p>
          To show weather and place details, the app sends requests directly from your browser to
          third-party services: Open-Meteo (forecast &amp; air quality), BigDataCloud (reverse
          geocoding), and Wikipedia/Wikimedia (descriptions, photos, map tiles). Those requests include
          the coordinates or place names you look up, subject to each provider&apos;s own policy.
        </p>
        <p>Clearing your browser storage removes everything AeroWeather has saved.</p>
      </>
    ),
  },
};

/** Footer "About Aero" / "Privacy" informational dialog. */
export function InfoDialog({ topic, onOpenChange }: Props) {
  const content = topic ? CONTENT[topic] : null;

  return (
    <Dialog open={topic !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg border-white/12"
        style={{ background: "oklch(0.17 0.02 245 / 0.96)" }}
      >
        {content ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">{content.title}</DialogTitle>
              <DialogDescription>{content.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm leading-relaxed text-foreground/80">{content.body}</div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
