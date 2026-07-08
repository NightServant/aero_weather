"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { getCityGallery } from "@/lib/api/city-details";
import type { Place } from "@/lib/api/types";

/** Responsive Wikimedia image grid: skeletons → fade-in tiles → click-to-enlarge
 *  lightbox. Navigate with ←/→ or by clicking the image; dismiss with the ✕,
 *  the backdrop, or Escape. */
export function LocationGallery({ place }: { place: Place }) {
  const [urls, setUrls] = useState<string[] | undefined>(undefined);
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUrls(undefined);
    setIndex(null);
    getCityGallery(place).then((r) => {
      if (!cancelled) setUrls(r);
    });
    return () => {
      cancelled = true;
    };
  }, [place]);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: number) =>
      setIndex((i) => (i === null || !urls ? i : (i + dir + urls.length) % urls.length)),
    [urls],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, step]);

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

  const hasMany = urls.length > 1;

  return (
    <>
      <ul className="grid grid-cols-3 gap-2">
        {urls.map((url, i) => (
          <li key={url}>
            <button
              type="button"
              onClick={() => setIndex(i)}
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

      {index !== null && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Photo ${index + 1} of ${urls.length}`}
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
                src={urls[index]}
                alt=""
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasMany) step(1);
                }}
                className={hasMany ? "max-h-[85vh] max-w-full cursor-pointer rounded-xl object-contain" : "max-h-[85vh] max-w-full rounded-xl object-contain"}
              />

              {hasMany ? (
                <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
                  {index + 1} / {urls.length}
                </span>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
