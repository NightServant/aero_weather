"use client";

import { Bell } from "lucide-react";
import { useActiveForecast } from "./active-forecast-context";
import { deriveAlerts } from "@/lib/api/alerts";

export function AlertCard({ className = "" }: { className?: string }) {
  const { data } = useActiveForecast();
  if (!data) return null;
  const [alert] = deriveAlerts(data);
  if (!alert) return null;

  return (
    <div
      role="status"
      className={`rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.07] lg:w-1/2 ${className}`}
    >
      <div className="flex items-center gap-2 text-foreground">
        <Bell className="size-3.5 text-accent-sun" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-sm font-semibold">{alert.title}</span>
      </div>
      <p className="caption mt-1.5">{alert.summary}</p>
    </div>
  );
}
