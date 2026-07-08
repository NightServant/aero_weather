"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getCityGallery } from "@/lib/api/city-details";
import type { Place } from "@/lib/api/types";

/** Responsive Wikimedia image grid: skeletons → lazy fade-in tiles → click-to-enlarge. */
export function LocationGallery({ place }: { place: Place }) {
  const [urls, setUrls] = useState<string[] | undefined>(undefined);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUrls(undefined);
    getCityGallery(place).then((r) => {
      if (!cancelled) setUrls(r);
    });
    return () => {
      cancelled = true;
    };
  }, [place]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (urls === undefined) {
    return (
      <div aria-busy="true" className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} aria-hidden="true" className="aspect-square animate-pulse rounded-lg bg-white/10" />
        ))}
      </div>
    );
  }
  if (urls.length === 0) {
    return <p className="caption">No photos available for this place yet.</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-3 gap-2">
        {urls.map((url) => (
          <li key={url}>
            <button
              type="button"
              onClick={() => setActive(url)}
              className="group relative block aspect-square w-full overflow-hidden rounded-lg"
              aria-label="Enlarge photo"
            >
              <Image
                src={url}
                alt=""
                fill
                loading="lazy"
                sizes="(max-width: 640px) 30vw, 160px"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:scale-105 data-[loaded=true]:opacity-100"
                onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "true")}
              />
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-6 backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active} alt="" className="max-h-[85vh] max-w-full rounded-xl object-contain" />
        </div>
      ) : null}
    </>
  );
}
