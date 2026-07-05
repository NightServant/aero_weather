"use client";

import {
  Cloud,
  CloudFog,
  CloudHail,
  Moon,
  Snowflake,
  Sun,
  Zap,
} from "lucide-react";
import type { WeatherKind } from "@/lib/api/weather-code";
import { WEATHER_LABEL } from "@/lib/api/weather-code";
import { cn } from "@/lib/utils";

type Props = {
  kind: WeatherKind;
  isDay: boolean;
  /** Box edge in px; scales every layer. Hero uses ~300, inline uses 20-48. */
  size?: number;
  animated?: boolean;
  className?: string;
};

/**
 * Layered lucide scene per weather kind (spec 4 keyframes, spec 1.2 accents).
 * Decorative layers are aria-hidden; the box itself carries the img semantics.
 * All loops stop under prefers-reduced-motion via the global kill switch.
 */
export function AnimatedWeatherIcon({ kind, isDay, size = 48, animated = true, className }: Props) {
  const label = `${WEATHER_LABEL[kind]}, ${isDay ? "day" : "night"}`;
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Scene kind={kind} isDay={isDay} size={size} animated={animated} />
    </span>
  );
}

function Scene({ kind, isDay, size, animated }: Required<Omit<Props, "className">>) {
  const stroke = 1.5;

  switch (kind) {
    case "clear":
    case "mainly-clear":
      return isDay ? (
        <Layer className={animated ? "animate-ray-spin" : undefined}>
          <Sun className="size-full text-accent-sun" strokeWidth={stroke} />
        </Layer>
      ) : (
        <Layer className={animated ? "animate-float" : undefined}>
          <Moon className="size-full text-[var(--scene-accent)]" strokeWidth={stroke} />
        </Layer>
      );

    case "partly-cloudy":
      return (
        <>
          <Layer
            className={animated ? (isDay ? "animate-ray-spin" : "animate-float") : undefined}
            style={{ width: "62%", height: "62%", top: 0, right: 0 }}
          >
            {isDay ? (
              <Sun className="size-full text-accent-sun" strokeWidth={stroke} />
            ) : (
              <Moon className="size-full text-[var(--scene-accent)]" strokeWidth={stroke} />
            )}
          </Layer>
          <Layer
            className={animated ? "animate-cloud-drift" : undefined}
            style={{ width: "78%", height: "78%", bottom: 0, left: 0 }}
          >
            <Cloud className="size-full text-[var(--scene-stroke)]" strokeWidth={stroke} />
          </Layer>
        </>
      );

    case "cloudy":
      return (
        <>
          <Layer
            className={animated ? "animate-cloud-drift" : undefined}
            style={{ width: "66%", height: "66%", top: 0, right: "4%", opacity: 0.55 }}
          >
            <Cloud className="size-full text-[var(--scene-stroke)]" strokeWidth={stroke} />
          </Layer>
          <Layer
            className={animated ? "animate-cloud-drift" : undefined}
            style={{ width: "82%", height: "82%", bottom: 0, left: 0, animationDelay: "-7s" }}
          >
            <Cloud className="size-full text-[var(--scene-stroke)]" strokeWidth={stroke} />
          </Layer>
        </>
      );

    case "fog":
      return (
        <Layer className={animated ? "animate-cloud-drift" : undefined}>
          <CloudFog className="size-full text-[var(--scene-stroke)]" strokeWidth={stroke} />
        </Layer>
      );

    case "drizzle":
    case "rain":
    case "rain-showers":
    case "freezing-rain":
      return (
        <>
          <Layer
            className={animated ? "animate-cloud-drift" : undefined}
            style={{ width: "84%", height: "72%", top: 0, left: "8%" }}
          >
            <Cloud className="size-full text-[var(--scene-stroke)]" strokeWidth={stroke} />
          </Layer>
          <RainDrops size={size} animated={animated} count={kind === "drizzle" ? 2 : 3} />
        </>
      );

    case "thunderstorm":
    case "thunderstorm-hail":
      return (
        <>
          <Layer
            className={animated ? "animate-cloud-drift" : undefined}
            style={{ width: "84%", height: "72%", top: 0, left: "8%" }}
          >
            {kind === "thunderstorm-hail" ? (
              <CloudHail className="size-full text-[var(--scene-stroke)]" strokeWidth={stroke} />
            ) : (
              <Cloud className="size-full text-[var(--scene-stroke)]" strokeWidth={stroke} />
            )}
          </Layer>
          <Layer
            className={animated ? "animate-flash" : undefined}
            style={{
              width: "40%",
              height: "44%",
              bottom: 0,
              left: "30%",
              opacity: animated ? undefined : 0.9,
            }}
          >
            <Zap
              className="size-full text-[var(--scene-accent)]"
              strokeWidth={stroke}
              fill="currentColor"
            />
          </Layer>
        </>
      );

    case "snow":
    case "snow-showers":
      return (
        <>
          <Layer
            className={animated ? "animate-cloud-drift" : undefined}
            style={{ width: "84%", height: "72%", top: 0, left: "8%" }}
          >
            <Cloud className="size-full text-[var(--scene-stroke)]" strokeWidth={stroke} />
          </Layer>
          <Layer
            className={animated ? "animate-droplet" : undefined}
            style={{ width: "26%", height: "26%", bottom: "2%", left: "38%" }}
          >
            <Snowflake className="size-full text-[var(--scene-accent)]" strokeWidth={stroke} />
          </Layer>
        </>
      );
  }
}

function Layer({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span aria-hidden="true" className={cn("absolute inset-0", className)} style={style}>
      {children}
    </span>
  );
}

function RainDrops({ size, animated, count }: { size: number; animated: boolean; count: number }) {
  const dropWidth = Math.max(1.5, size * 0.04);
  return (
    <span aria-hidden="true" className="absolute inset-x-[22%] bottom-0 h-[30%]">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn("absolute rounded-full bg-accent-droplet", animated && "animate-rain-fall")}
          style={{
            width: dropWidth,
            height: size * 0.14,
            left: `${(i + 0.5) * (100 / count)}%`,
            animationDelay: `${i * 0.15}s`,
            opacity: animated ? undefined : 0.8,
          }}
        />
      ))}
    </span>
  );
}
