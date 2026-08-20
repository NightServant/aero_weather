import type { Metadata } from "next";
import { SettingsSection } from "@/components/sections/settings-section";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Units, locale, and notification preferences for AeroWeather - stored on this device only.",
};

export default function SettingsPage() {
  return <SettingsSection />;
}
