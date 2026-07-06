"use client";

import { relativeGreeting } from "@/lib/format";

type Props = {
  timezone?: string;
  summary: string;
};

/** Page heading card: blue greeting h1 + live one-line summary (Figma 10:11415). */
export function GreetingHeader({ timezone, summary }: Props) {
  return (
    <div className="mt-8 text-center lg:text-left">
      <h1 id="today-h" className="text-headline">{relativeGreeting(new Date(), timezone)}!</h1>
      <p className="text-subtitle mt-2">{summary}</p>
    </div>
  );
}
