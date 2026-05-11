"use client";

import { Bell } from "lucide-react";
import { useActiveForecast } from "./active-forecast-context";
import { deriveAlerts } from "@/lib/api/alerts";

export function AlertCard() {
  const { data } = useActiveForecast();
  if (!data) return null;
  const [alert] = deriveAlerts(data);
  if (!alert) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-white">
        <Bell className="size-3.5" strokeWidth={1.5} />
        <span className="text-xs font-semibold">{alert.title}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-white/60">{alert.summary}</p>
    </div>
  );
}

export function FreeForEveryoneCard() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
      <p className="text-xs leading-relaxed text-white/55">
        <span className="block text-white/80 font-medium">Free for everyone.</span>
        No sign-up required.
      </p>
    </div>
  );
}
