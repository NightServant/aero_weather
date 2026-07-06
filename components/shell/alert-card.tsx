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
    <div role="status" className="hidden lg:block lg:w-1/2">
      <div className="flex items-center gap-2 text-foreground">
        <Bell className="size-3.5 text-accent-sun" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-sm font-semibold">{alert.title}</span>
      </div>
      <p className="caption mt-2">{alert.summary}</p>
    </div>
  );
}
