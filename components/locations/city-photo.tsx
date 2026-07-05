"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCityImage } from "./use-city-image";
import type { Place } from "@/lib/api/types";

type Props = {
  place: Place;
  /** Intrinsic box passed to next/image; the wrapper fixes the layout box so
   *  there is zero CLS across skeleton -> photo/gradient swaps. */
  width: number;
  height: number;
  /** Tailwind classes for the fixed wrapper box (size + radius). */
  className?: string;
  /** Initial-letter size for the gradient fallback. */
  initialClassName?: string;
};

/**
 * City photo with three states: skeleton shimmer while resolving, gradient
 * fallback with the city initial when no photo exists, else next/image.
 * Decorative throughout - the adjacent text carries the city name.
 */
export function CityPhoto({ place, width, height, className, initialClassName }: Props) {
  const src = useCityImage(place);

  return (
    <div className={cn("relative shrink-0 overflow-hidden", className)}>
      {src === undefined ? (
        <div aria-hidden="true" className="size-full animate-pulse bg-white/10" />
      ) : src === null ? (
        <div
          aria-hidden="true"
          className="grid size-full place-items-center bg-[linear-gradient(160deg,oklch(0.45_0.06_242)_0%,oklch(0.32_0.04_248)_55%,oklch(0.24_0.03_252)_100%)]"
        >
          <span className={cn("font-semibold text-white/25 select-none", initialClassName)}>
            {place.name.charAt(0).toUpperCase()}
          </span>
        </div>
      ) : (
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          className="size-full object-cover"
        />
      )}
    </div>
  );
}
