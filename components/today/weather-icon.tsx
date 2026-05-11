"use client";

import type { WeatherKind } from "@/lib/api/weather-code";
import { cn } from "@/lib/utils";

export function WeatherIcon({ kind, isDay, className }: { kind: WeatherKind; isDay: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-6", className)} fill="none">
      {renderIcon(kind, isDay)}
    </svg>
  );
}

function renderIcon(kind: WeatherKind, isDay: boolean) {
  const stroke = "currentColor";
  const sw = 1.4;

  if (!isDay && (kind === "clear" || kind === "mainly-clear")) {
    return (
      <path d="M20 8a8 8 0 1 0 4 12 7 7 0 0 1-4-12z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    );
  }

  if (kind === "clear" || kind === "mainly-clear") {
    return (
      <g stroke={stroke} strokeWidth={sw} strokeLinecap="round">
        <circle cx="16" cy="16" r="5" />
        <line x1="16" y1="3" x2="16" y2="6" />
        <line x1="16" y1="26" x2="16" y2="29" />
        <line x1="3" y1="16" x2="6" y2="16" />
        <line x1="26" y1="16" x2="29" y2="16" />
        <line x1="6.7" y1="6.7" x2="8.8" y2="8.8" />
        <line x1="23.2" y1="23.2" x2="25.3" y2="25.3" />
        <line x1="6.7" y1="25.3" x2="8.8" y2="23.2" />
        <line x1="23.2" y1="8.8" x2="25.3" y2="6.7" />
      </g>
    );
  }

  if (kind === "partly-cloudy") {
    return (
      <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M22 22h-9a4 4 0 1 1 1.3-7.8A6 6 0 0 1 26 16a3.5 3.5 0 1 1-4 6z" />
      </g>
    );
  }

  if (kind === "cloudy" || kind === "fog") {
    return (
      <path
        d="M9 21h14a4 4 0 0 0 .5-8 6.5 6.5 0 0 0-12.5 1.5A4 4 0 0 0 9 21z"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    );
  }

  if (kind === "drizzle" || kind === "rain" || kind === "rain-showers" || kind === "freezing-rain") {
    return (
      <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 17h14a4 4 0 0 0 .5-8 6.5 6.5 0 0 0-12.5 1.5A4 4 0 0 0 9 17z" />
        <line x1="12" y1="22" x2="11" y2="26" />
        <line x1="17" y1="22" x2="16" y2="26" />
        <line x1="22" y1="22" x2="21" y2="26" />
      </g>
    );
  }

  if (kind === "thunderstorm" || kind === "thunderstorm-hail") {
    return (
      <g stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 17h14a4 4 0 0 0 .5-8 6.5 6.5 0 0 0-12.5 1.5A4 4 0 0 0 9 17z" />
        <path d="M15 19l-3 5h3l-1 4 4-6h-3l1-3z" fill="var(--scene-accent, currentColor)" stroke="none" />
      </g>
    );
  }

  if (kind === "snow" || kind === "snow-showers") {
    return (
      <g stroke={stroke} strokeWidth={sw} strokeLinecap="round">
        <path d="M9 17h14a4 4 0 0 0 .5-8 6.5 6.5 0 0 0-12.5 1.5A4 4 0 0 0 9 17z" strokeLinejoin="round" />
        <g>
          <line x1="13" y1="20" x2="13" y2="26" />
          <line x1="11" y1="22" x2="15" y2="24" />
          <line x1="11" y1="24" x2="15" y2="22" />
        </g>
        <g>
          <line x1="20" y1="20" x2="20" y2="26" />
          <line x1="18" y1="22" x2="22" y2="24" />
          <line x1="18" y1="24" x2="22" y2="22" />
        </g>
      </g>
    );
  }

  return null;
}
