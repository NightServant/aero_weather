"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WeatherKind } from "@/lib/api/weather-code";
import { WEATHER_LABEL } from "@/lib/api/weather-code";

type Props = {
  kind: WeatherKind;
  isDay: boolean;
  high?: string;
  low?: string;
  className?: string;
};

export function WeatherScene({ kind, isDay, high, low, className }: Props) {
  return (
    <div
      style={{ color: "var(--hero-text)" }}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl hero-gradient grain-overlay min-h-[260px] p-5 border border-[var(--hairline-strong)]",
        className,
      )}
    >
      <Badge
        variant="secondary"
        style={{
          backgroundColor: "color-mix(in oklch, var(--hero-text) 14%, transparent)",
          color: "var(--hero-text)",
        }}
        className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase backdrop-blur-sm"
      >
        {WEATHER_LABEL[kind]}
      </Badge>

      <div className="absolute inset-0 grid place-items-center">
        <SceneArt kind={kind} isDay={isDay} />
      </div>

      {high || low ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-between px-5 text-xs font-medium tabular opacity-80">
          {high ? <span>H {high}</span> : <span />}
          {low ? <span>L {low}</span> : <span />}
        </div>
      ) : null}
    </div>
  );
}

function SceneArt({ kind, isDay }: { kind: WeatherKind; isDay: boolean }) {
  if (!isDay && (kind === "clear" || kind === "mainly-clear")) {
    return <Moon />;
  }
  if (kind === "clear" || kind === "mainly-clear") return <Sun />;
  if (kind === "partly-cloudy") return <PartlyCloudy />;
  if (kind === "cloudy" || kind === "fog") return <Clouds />;
  if (kind === "drizzle" || kind === "rain" || kind === "rain-showers" || kind === "freezing-rain")
    return <Rain />;
  if (kind === "thunderstorm" || kind === "thunderstorm-hail") return <Storm />;
  if (kind === "snow" || kind === "snow-showers") return <Snow />;
  return <Sun />;
}

function Sun() {
  return (
    <svg viewBox="0 0 200 200" className="size-44">
      <defs>
        <radialGradient id="aero-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--scene-accent)" stopOpacity="0.55" />
          <stop offset="60%" stopColor="var(--scene-accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--scene-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#aero-sun-glow)" />
      <g style={{ transformOrigin: "100px 100px", animation: "aero-spin-slow 60s linear infinite" }}>
        <g
          stroke="var(--scene-stroke)"
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12;
            const rad = (angle * Math.PI) / 180;
            const long = i % 2 === 0;
            const x1 = 100 + Math.cos(rad) * 48;
            const y1 = 100 + Math.sin(rad) * 48;
            const x2 = 100 + Math.cos(rad) * (long ? 82 : 68);
            const y2 = 100 + Math.sin(rad) * (long ? 82 : 68);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
      </g>
      <circle cx="100" cy="100" r="30" fill="var(--scene-accent)" />
      <circle cx="100" cy="100" r="30" fill="none" stroke="var(--scene-stroke)" strokeWidth={1.5} strokeDasharray="2 4" opacity={0.45} />
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 200 200" className="size-44">
      <path
        d="M130 60a55 55 0 1 0 28 78 48 48 0 0 1-28-78z"
        fill="var(--scene-accent)"
        stroke="var(--scene-stroke)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <g fill="var(--scene-accent)" opacity={0.7}>
        <circle cx="55" cy="60" r="1.6" />
        <circle cx="80" cy="40" r="1.2" />
        <circle cx="35" cy="120" r="1.4" />
        <circle cx="160" cy="55" r="1.6" />
      </g>
    </svg>
  );
}

function PartlyCloudy() {
  return (
    <svg viewBox="0 0 220 200" className="h-44 w-52">
      <g fill="var(--scene-accent)" stroke="var(--scene-stroke)" strokeWidth={3}>
        <circle cx="75" cy="80" r="26" />
      </g>
      <path
        d="M85 145h70a18 18 0 0 0 2-36 30 30 0 0 0-58 7 18 18 0 0 0-14 29z"
        fill="white"
        fillOpacity={0.55}
        stroke="var(--scene-stroke)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Clouds() {
  return (
    <svg viewBox="0 0 220 200" className="h-44 w-52">
      <path
        d="M45 130h130a22 22 0 0 0 2-44 36 36 0 0 0-70 9 22 22 0 0 0-62 35z"
        fill="white"
        fillOpacity={0.7}
        stroke="var(--scene-stroke)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d="M75 160h90a16 16 0 0 0 0-32 22 22 0 0 0-42 4 16 16 0 0 0-48 28z"
        fill="white"
        fillOpacity={0.4}
        stroke="var(--scene-stroke)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Rain() {
  return (
    <svg viewBox="0 0 220 220" className="h-48 w-52">
      <path
        d="M50 110h120a22 22 0 0 0 2-44 36 36 0 0 0-70 9 22 22 0 0 0-52 35z"
        fill="white"
        fillOpacity={0.7}
        stroke="var(--scene-stroke)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={70 + i * 22}
          y1={130}
          x2={64 + i * 22}
          y2={170}
          stroke="var(--scene-stroke)"
          strokeWidth={3}
          strokeLinecap="round"
          style={{ animation: `aero-droplet 1.4s ease-in ${i * 140}ms infinite` }}
        />
      ))}
    </svg>
  );
}

function Storm() {
  return (
    <svg viewBox="0 0 220 220" className="h-48 w-52">
      <path
        d="M50 110h120a22 22 0 0 0 2-44 36 36 0 0 0-70 9 22 22 0 0 0-52 35z"
        fill="white"
        fillOpacity={0.55}
        stroke="var(--scene-stroke)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d="M118 125l-22 38h18l-8 28 30-44h-18l8-22z"
        fill="var(--scene-accent)"
        stroke="var(--scene-stroke)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Snow() {
  return (
    <svg viewBox="0 0 220 220" className="h-48 w-52">
      <path
        d="M50 110h120a22 22 0 0 0 2-44 36 36 0 0 0-70 9 22 22 0 0 0-52 35z"
        fill="white"
        fillOpacity={0.75}
        stroke="var(--scene-stroke)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {[80, 130, 180].map((cx, i) => (
        <g key={cx} stroke="var(--scene-stroke)" strokeWidth={2.5} strokeLinecap="round">
          <line x1={cx} y1={130 + (i % 2) * 6} x2={cx} y2={170 + (i % 2) * 6} />
          <line x1={cx - 12} y1={150 + (i % 2) * 6} x2={cx + 12} y2={150 + (i % 2) * 6} />
          <line x1={cx - 10} y1={140 + (i % 2) * 6} x2={cx + 10} y2={160 + (i % 2) * 6} />
          <line x1={cx - 10} y1={160 + (i % 2) * 6} x2={cx + 10} y2={140 + (i % 2) * 6} />
        </g>
      ))}
    </svg>
  );
}
