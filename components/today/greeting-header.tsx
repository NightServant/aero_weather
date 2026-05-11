"use client";

import { formatDate, relativeGreeting } from "@/lib/format";

type Props = {
  isoDate: string;
  timezone?: string;
  summary?: string;
};

export function GreetingHeader({ isoDate, timezone, summary }: Props) {
  const greeting = relativeGreeting(new Date(), timezone);
  const date = formatDate(isoDate, timezone).toUpperCase();

  return (
    <header className="space-y-2">
      <div className="eyebrow stagger-1">Today · {date.split(", ").slice(1).join(", ") || date}</div>
      <h1 className="stagger-2 text-[2.75rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
        {greeting}
      </h1>
      {summary ? (
        <p className="stagger-3 max-w-2xl text-sm text-muted-foreground">{summary}</p>
      ) : null}
    </header>
  );
}
