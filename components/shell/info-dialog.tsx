"use client";

import {
  CloudSun,
  ShieldCheck,
  Globe,
  Sparkles,
  DatabaseZap,
  Gift,
  ServerOff,
  HardDrive,
  Share2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
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

type Point = { icon: LucideIcon; text: React.ReactNode };

const CONTENT: Record<
  InfoTopic,
  { icon: LucideIcon; title: string; description: string; points: Point[] }
> = {
  about: {
    icon: CloudSun,
    title: "About AeroWeather",
    description: "Local-first weather. Free for everyone, no sign-up.",
    points: [
      { icon: Globe, text: "Current conditions and a two-week outlook for any city in the world." },
      { icon: Sparkles, text: "Built with Next.js 16 and React 19, in a dark glassmorphic interface." },
      { icon: DatabaseZap, text: "Data from Open-Meteo; imagery and places from Wikipedia and Wikimedia." },
      { icon: Gift, text: "No account, no premium tier, no rate limits — just weather." },
    ],
  },
  privacy: {
    icon: ShieldCheck,
    title: "Privacy",
    description: "No accounts, no tracking, no analytics.",
    points: [
      { icon: ServerOff, text: "No backend of our own, and no personal data collected." },
      {
        icon: HardDrive,
        text: (
          <>
            Your preferences live only in this device&apos;s{" "}
            <code className="rounded bg-white/10 px-1 py-0.5 text-[0.8em] text-text-mid">localStorage</code>.
          </>
        ),
      },
      { icon: Share2, text: "Look-ups go straight from your browser to Open-Meteo, BigDataCloud, and Wikimedia." },
      { icon: Trash2, text: "Clearing your browser storage removes everything AeroWeather has saved." },
    ],
  },
};

/** Footer "About Aero" / "Privacy" informational dialog. */
export function InfoDialog({ topic, onOpenChange }: Props) {
  const content = topic ? CONTENT[topic] : null;
  const HeaderIcon = content?.icon;

  return (
    <Dialog open={topic !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md border-white/12"
        style={{ background: "oklch(0.17 0.02 245 / 0.96)" }}
      >
        {content ? (
          <>
            <DialogHeader className="flex-row items-start gap-3.5">
              {HeaderIcon ? (
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <HeaderIcon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
              ) : null}
              <div className="min-w-0 space-y-1 pt-0.5">
                <DialogTitle className="text-lg leading-tight">{content.title}</DialogTitle>
                <DialogDescription className="text-text-mid">{content.description}</DialogDescription>
              </div>
            </DialogHeader>

            <ul className="mt-1 space-y-3.5">
              {content.points.map((point, i) => {
                const Icon = point.icon;
                return (
                  <li key={i} className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
                    <p className="text-sm leading-relaxed text-foreground/85">{point.text}</p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
