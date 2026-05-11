"use client";

import { SettingsSection } from "./settings-section";
import { ToggleRow } from "./toggle-row";
import { usePrefs } from "@/hooks/use-prefs";
import { toast } from "sonner";

export function NotificationsSection() {
  const [prefs, setPrefs] = usePrefs();
  const n = prefs.notifications;

  const setKey = <K extends keyof typeof n>(key: K, value: (typeof n)[K]) => {
    setPrefs({ notifications: { ...n, [key]: value } });
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
    <SettingsSection
      title="Notifications"
      description="Get notified about weather that matters to you."
    >
      <ToggleRow
        label="Push notifications"
        description="Required for the alerts below."
        checked={n.push}
        onChange={onPushToggle}
      />
      <ToggleRow
        label="Severe weather alerts"
        description="Watches and warnings in your area."
        checked={n.severeWeather}
        onChange={(v) => setKey("severeWeather", v)}
      />
      <ToggleRow
        label="Daily morning briefing"
        description="7:00 AM summary of the day ahead."
        checked={n.dailyBriefing}
        onChange={(v) => setKey("dailyBriefing", v)}
      />
      <ToggleRow
        label="Rain starting soon"
        description="30-minute heads-up before precipitation."
        checked={n.rainStartingSoon}
        onChange={(v) => setKey("rainStartingSoon", v)}
      />
    </SettingsSection>
  );
}
