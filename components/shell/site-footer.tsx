"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Info, ShieldCheck } from "lucide-react";
import { InfoDialog, type InfoTopic } from "./info-dialog";

/** Footer inventory is fixed by DESIGN-SPEC section 8. */
const COLUMNS: {
  heading: string;
  links: { label: string; href?: string; external?: boolean; dialog?: InfoTopic; icon?: React.ReactNode }[];
}[] = [
  {
    heading: "Weather",
    links: [
      { label: "Today", href: "#today" },
      { label: "2-week outlook", href: "#forecast" },
      { label: "Locations", href: "#locations" },
      { label: "Settings", href: "#settings" },
    ],
  },
  {
    heading: "Features",
    links: [
      { label: "Search cities", href: "#locations" },
      { label: "Use my location", href: "#today" },
      { label: "Weather alerts", href: "#today" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Weather Data by Open-Meteo", href: "https://open-meteo.com/", external: true, icon: <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> },
      { label: "Reverse geocoding by BigDataCloud", href: "https://www.bigdatacloud.com/", external: true, icon: <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> },
      { label: "UV index scale", href: "https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index", external: true, icon: <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> },
      { label: "US AQI categories", href: "https://www.airnow.gov/aqi/aqi-basics/", external: true, icon: <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> },
      { label: "About Aero", dialog: "about", icon: <Info className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> },
      { label: "Privacy", dialog: "privacy", icon: <ShieldCheck className="size-3.5" strokeWidth={1.5} aria-hidden="true" /> },
    ],
  },
];

export function SiteFooter() {
  const [topic, setTopic] = useState<InfoTopic | null>(null);

  return (
    <footer className="mt-16 border-t border-white/[0.08] bg-[oklch(0.25_0.03_240/0.6)] backdrop-blur">
      <div className="mx-auto grid max-w-[1188px] gap-10 px-6 py-12 md:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/brand/aero-logo.svg" alt="" width={40} height={40} />
          </div>
          <p className="mt-4 text-[15px] font-semibold">
            <span className="text-primary">Aero</span>
            <span className="text-foreground">Weather</span>
          </p>
          <p className="caption mt-1">Local-first weather. Free for everyone, no sign-up.</p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className="text-[15px] font-semibold text-foreground">{col.heading}</h2>
            <ul className="mt-3">
              {col.links.map((link) => {
                const cls =
                  "group inline-flex items-center gap-1.5 text-sm text-text-mid transition-colors duration-150 hover:text-foreground";
                const iconWrap = link.icon ? (
                  <span className="text-text-mid/60 transition-colors duration-150 group-hover:text-foreground">
                    {link.icon}
                  </span>
                ) : null;
                return (
                  <li key={link.label} className="leading-[34px]">
                    {link.dialog ? (
                      <button type="button" onClick={() => setTopic(link.dialog!)} className={cls}>
                        {link.label}
                        {iconWrap}
                      </button>
                    ) : link.external ? (
                      <a href={link.href} target="_blank" rel="noreferrer" className={cls}>
                        {link.label}
                        {iconWrap}
                      </a>
                    ) : (
                      <Link href={link.href!} className={cls}>
                        {link.label}
                        {iconWrap}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div className="bg-white/[0.06] backdrop-blur">
        <div className="mx-auto flex max-w-[1188px] flex-col gap-1 px-6 py-3 text-[13px] text-text-mid sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Aero · v1.0.0</p>
          <div className="sm:text-right">
            <p>Weather data © Open-Meteo (CC BY 4.0) · Made with Next.js</p>
            <p>
              City &amp; sky imagery via{" "}
              <a
                href="https://commons.wikimedia.org/"
                target="_blank"
                rel="noreferrer"
                className="underline-offset-2 transition-colors duration-150 hover:text-foreground hover:underline"
              >
                Wikimedia Commons
              </a>{" "}
              (W.carter CC0; Basile Morin, GerritR CC BY-SA 4.0) and{" "}
              <a
                href="https://stocksnap.io/"
                target="_blank"
                rel="noreferrer"
                className="underline-offset-2 transition-colors duration-150 hover:text-foreground hover:underline"
              >
                StockSnap
              </a>{" "}
              (CC0)
            </p>
          </div>
        </div>
      </div>

      <InfoDialog topic={topic} onOpenChange={(open) => !open && setTopic(null)} />
    </footer>
  );
}
