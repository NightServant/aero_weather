"use client";

import { SectionHeader } from "./section-header";
import { UnitsLocaleSection } from "@/components/settings/units-locale-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { usePrefs } from "@/hooks/use-prefs";
import { Skeleton } from "@/components/ui/skeleton";

/** Settings section: Units + Notifications stacked (purer scroll — no tab switcher). */
export function SettingsSection() {
  const [, , hydrated] = usePrefs();

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
        {hydrated ? <UnitsLocaleSection /> : <SettingsCardRowSkeleton />}
      </div>

      <div className="space-y-4">
        <p className="card-subtitle-caps">Notifications</p>
        {hydrated ? <NotificationsSection /> : <SettingsCardRowSkeleton />}
      </div>
    </div>
  );
}

/** Four preference cards matching the real settings grammar: icon + control on
 *  top, label + caption below. */
function SettingsCardRowSkeleton() {
  return (
    <div aria-busy="true" className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <Skeleton aria-hidden="true" className="size-10 shrink-0 rounded-xl" />
            <Skeleton aria-hidden="true" className="h-7 w-24 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton aria-hidden="true" className="h-4 w-28 rounded" />
            <Skeleton aria-hidden="true" className="h-3 w-36 max-w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
