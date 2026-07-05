"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { GlassCard } from "@/components/aero/glass-card";
import { PillTabs } from "@/components/aero/pill-tabs";
import { UnitsLocaleSection } from "@/components/settings/units-locale-section";
import { NotificationsSection } from "@/components/settings/notifications-section";

type TabKey = "units" | "notifications";

const TABS: { value: TabKey; label: string }[] = [
  { value: "units", label: "Units and locale" },
  { value: "notifications", label: "Notifications" },
];

const PANEL_PREFIX = "settings";

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("units");

  return (
    <div className="space-y-6 pt-2">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <GlassCard
          variant="glass"
          className="stagger-1 flex w-full max-w-[240px] flex-col items-start gap-3 p-6"
        >
          <Settings aria-hidden="true" className="size-8 text-foreground/80" strokeWidth={1.5} />
          <p className="kicker">Settings</p>
        </GlassCard>

        <PillTabs
          tabs={TABS}
          value={tab}
          onValueChange={(v) => setTab(v as TabKey)}
          ariaLabel="Settings sections"
          panelIdPrefix={PANEL_PREFIX}
          className="stagger-2"
        />
      </header>

      <GlassCard variant="glass" as="section" className="stagger-2 px-6 py-8 sm:px-10 sm:py-9">
        <h1 className="text-headline">Preferences</h1>
        <p className="text-subtitle mt-2 max-w-2xl">
          Customize units, alerts, and how Aero behaves.
        </p>
      </GlassCard>

      <hr className="stagger-3 border-border" />

      <div
        role="tabpanel"
        id={`${PANEL_PREFIX}-${tab}`}
        aria-labelledby={`${PANEL_PREFIX}-tab-${tab}`}
      >
        {tab === "units" ? <UnitsLocaleSection /> : <NotificationsSection />}
      </div>
    </div>
  );
}
