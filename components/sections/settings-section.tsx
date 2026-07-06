"use client";

import { SectionHeader } from "./section-header";
import { UnitsLocaleSection } from "@/components/settings/units-locale-section";
import { NotificationsSection } from "@/components/settings/notifications-section";

/** Settings section: Units + Notifications stacked (purer scroll — no tab switcher). */
export function SettingsSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        id="settings-h"
        kicker="Settings"
        title="Preferences"
        subtitle="Customize units, alerts, and how Aero behaves."
      />

      <div className="space-y-4">
        <p className="card-subtitle-caps">Units and locale</p>
        <UnitsLocaleSection />
      </div>

      <div className="space-y-4">
        <p className="card-subtitle-caps">Notifications</p>
        <NotificationsSection />
      </div>
    </div>
  );
}
