"use client";

import { useState } from "react";
import { Bell, Globe2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnitsLocaleSection } from "@/components/settings/units-locale-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { AboutSection } from "@/components/settings/about-section";

type TabKey = "units" | "notifications" | "about";

const TABS: { key: TabKey; label: string; icon: typeof Bell }[] = [
  { key: "units", label: "Units & Locale", icon: Globe2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "about", label: "About", icon: Info },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("units");

  return (
    <div className="space-y-8 pt-2">
      <header className="space-y-2">
        <div className="eyebrow stagger-1">Settings</div>
        <h1 className="stagger-2 text-[2.5rem] font-bold leading-tight tracking-tight text-foreground sm:text-[3rem]">
          Preferences
        </h1>
        <p className="stagger-3 max-w-2xl text-sm text-muted-foreground">
          Customize units, alerts, and how Aero behaves.
        </p>
      </header>

      <div className="stagger-4 grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-1 md:flex-col" aria-label="Settings sections">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left",
                  active
                    ? "bg-foreground/5 text-foreground border border-[var(--hairline-strong)]"
                    : "text-foreground/65 hover:text-foreground hover:bg-foreground/[0.03] border border-transparent",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                <span className="flex-1">{label}</span>
              </button>
            );
          })}
        </nav>

        <div>
          {tab === "units" && <UnitsLocaleSection />}
          {tab === "notifications" && <NotificationsSection />}
          {tab === "about" && <AboutSection />}
        </div>
      </div>
    </div>
  );
}
