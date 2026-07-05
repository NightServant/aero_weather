"use client";

import { GlassCard } from "@/components/aero/glass-card";
import { relativeGreeting } from "@/lib/format";

type Props = {
  timezone?: string;
  summary: string;
};

/** Page heading card: blue greeting h1 + live one-line summary (Figma 10:11415). */
export function GreetingHeader({ timezone, summary }: Props) {
  return (
    <GlassCard variant="glass" className="stagger-1 px-8 py-8">
      <h1 className="text-headline">{relativeGreeting(new Date(), timezone)}!</h1>
      <p className="text-subtitle mt-2">{summary}</p>
    </GlassCard>
  );
}
