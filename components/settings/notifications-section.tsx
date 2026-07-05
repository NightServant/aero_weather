"use client";

import { ToggleRow } from "./toggle-row";
import { usePrefs } from "@/hooks/use-prefs";
import { toast } from "sonner";

export function NotificationsSection() {
  const [prefs, setPrefs] = usePrefs();
  const n = prefs.notifications;

  const setKey = <K extends keyof typeof n>(key: K, value: (typeof n)[K]) => {
    setPrefs((p) => ({ ...p, notifications: { ...p.notifications, [key]: value } }));
  };

  const onPushToggle = async (value: boolean) => {
    if (value && typeof Notification !== "undefined" && Notification.permission === "default") {
      const result = await Notification.requestPermission();
      if (result !== "granted") {
        toast.error("Push permission denied by the browser.");
        return;
      }
    }
    setKey("push", value);
  };

  return (
    <div className="grid gap-4">
      <h2 className="sr-only">Notifications</h2>
      <ToggleRow
        className="stagger-1"
        label="Push notifications"
        description="Required for the alerts below."
        checked={n.push}
        onChange={onPushToggle}
      />
      <ToggleRow
        className="stagger-2"
        label="Severe weather alerts"
        description="Watches and warnings in your area."
        checked={n.severeWeather}
        onChange={(v) => setKey("severeWeather", v)}
      />
      <ToggleRow
        className="stagger-3"
        label="Daily morning briefing"
        description="7:00 AM summary of the day ahead."
        checked={n.dailyBriefing}
        onChange={(v) => setKey("dailyBriefing", v)}
      />
      <ToggleRow
        className="stagger-4"
        label="Rain starting soon"
        description="30-minute heads-up before precipitation."
        checked={n.rainStartingSoon}
        onChange={(v) => setKey("rainStartingSoon", v)}
      />
    </div>
  );
}
