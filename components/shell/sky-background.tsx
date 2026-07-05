"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActiveForecast } from "./active-forecast-context";
import type { PaletteKey } from "@/lib/prefs";

/**
 * Weather-adaptive sky. Fixed full-bleed stack behind the app (spec section 5):
 *   1. gradient base painted from the active `[data-palette]` variables (always present)
 *   2. sky photo for palettes that have one (enhancement only; cross-fades in on load)
 *   3. scrim (guarantees text contrast; cloudy gets an extra top band)
 *   4. grain overlay
 */

const SKY_PHOTOS: Partial<Record<PaletteKey, string>> = {
  sunset: "/skies/sunset.webp",
  stormy: "/skies/stormy.webp",
  cloudy: "/skies/cloudy.webp",
  night: "/skies/night.webp",
};

const GRADIENT =
  "radial-gradient(120% 80% at 75% 25%, var(--hero-glow), transparent 60%), " +
  "linear-gradient(160deg, var(--hero-from) 0%, var(--hero-via) 55%, var(--hero-to) 100%)";

const SCRIM =
  "linear-gradient(180deg, oklch(0.13 0.02 250 / 0.55) 0%, oklch(0.13 0.02 250 / 0.25) 35%, oklch(0.10 0.02 250 / 0.60) 100%)";

// The cloudy plate is the brightest photo; spec adds a top band on top of the standard scrim.
const CLOUDY_TOP_BAND = "linear-gradient(180deg, oklch(0.10 0.02 250 / 0.15) 0%, transparent 30%)";

export function SkyBackground({ palette }: { palette?: PaletteKey }) {
  const { paletteKey } = useActiveForecast();
  const active: PaletteKey = palette ?? paletteKey ?? "night";
  const src = SKY_PHOTOS[active];

  // Keep the previous photo underneath while the next one fades in.
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const lastSrc = useRef<string | undefined>(src);
  // Only the initial plate competes for LCP; later swaps load politely.
  const firstPhoto = useRef(true);
  useEffect(() => {
    if (lastSrc.current === src) return;
    firstPhoto.current = false;
    setPrevSrc(lastSrc.current ?? null);
    lastSrc.current = src;
  }, [src]);
  const clearPrev = useCallback(() => setPrevSrc(null), []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 1. Gradient base: always painted, nothing may depend on the photo. */}
      <div className="absolute inset-0" style={{ background: GRADIENT }} />

      {/* 2. Photo layer (only for keys that ship one). */}
      {prevSrc && prevSrc !== src ? (
        <Image
          src={prevSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.65]"
        />
      ) : null}
      {src ? (
        <SkyPhoto key={src} src={src} priority={firstPhoto.current} onSettled={clearPrev} />
      ) : null}

      {/* 3. Scrim: always painted above the photo. */}
      <div
        className="absolute inset-0"
        style={{ background: active === "cloudy" ? `${CLOUDY_TOP_BAND}, ${SCRIM}` : SCRIM }}
      />

      {/* 4. Grain. */}
      <div className="grain-overlay absolute inset-0" />
    </div>
  );
}

function SkyPhoto({
  src,
  priority,
  onSettled,
}: {
  src: string;
  priority: boolean;
  onSettled: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  // Drop the previous plate once this one has fully faded in.
  useEffect(() => {
    if (!loaded) return;
    const t = window.setTimeout(onSettled, 700);
    return () => window.clearTimeout(t);
  }, [loaded, onSettled]);

  return (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      sizes="100vw"
      onLoad={() => setLoaded(true)}
      className={`object-cover transition-opacity duration-[600ms] ease-out ${
        loaded ? "opacity-[0.65]" : "opacity-0"
      }`}
    />
  );
}
