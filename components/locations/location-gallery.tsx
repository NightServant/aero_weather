"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { getCityGallery } from "@/lib/api/city-details";
import type { Place } from "@/lib/api/types";

/** Responsive Wikimedia image grid: skeletons → fade-in tiles → click-to-enlarge
 *  lightbox with a close button, backdrop click, and Escape to dismiss. */
export function LocationGallery({ place }: { place: Place }) {
  const [urls, setUrls] = useState<string[] | undefined>(undefined);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUrls(undefined);
    setActive(null);
    getCityGallery(place).then((r) => {
      if (!cancelled) setUrls(r);
    });
    return () => {
      cancelled = true;
    };
  }, [place]);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

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
        {urls.map((url, i) => (
          <li key={url}>
            <button
              type="button"
              onClick={() => setActive(url)}
              className="group relative block aspect-square w-full overflow-hidden rounded-lg"
              aria-label={`Enlarge photo ${i + 1} of ${urls.length}`}
            >
              <Image
                src={url}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 30vw, 160px"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:scale-105 data-[loaded=true]:opacity-100"
                onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "true")}
              />
            </button>
          </li>
        ))}
      </ul>

      {active && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Enlarged photo"
              onClick={close}
              className="fixed inset-0 z-[1000] grid place-items-center bg-black/80 p-4 backdrop-blur-sm sm:p-6"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/25 transition-colors hover:bg-black/65"
              >
                <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active}
                alt=""
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] max-w-full rounded-xl object-contain"
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
