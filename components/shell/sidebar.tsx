"use client";

import { CalendarDays, Home, MapPin, Settings as SettingsIcon } from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav-item";
import { AlertCard, FreeForEveryoneCard } from "./alert-card";

function AeroMark() {
  return (
    <svg viewBox="0 0 40 40" className="size-10">
      <defs>
        <linearGradient id="aero-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--palette-accent, oklch(0.65 0.2 255))" />
          <stop offset="100%" stopColor="var(--palette-accent, oklch(0.55 0.18 280))" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#aero-mark)" />
      <path
        d="M11 27h14a4.5 4.5 0 0 0 .8-9 6.5 6.5 0 0 0-12.6 1.4A4 4 0 0 0 11 27z"
        fill="white"
        fillOpacity={0.95}
      />
      <line x1="14" y1="31" x2="13" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="31" x2="19" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26" y1="31" x2="25" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col gap-6 border-r border-white/[0.04] bg-sidebar px-5 py-7 text-sidebar-foreground">
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" aria-hidden />

      <div className="flex items-center gap-3 px-1">
        <AeroMark />
        <div className="leading-tight">
          <div className="text-base font-bold text-white">Aero</div>
          <div className="text-[10px] font-semibold tracking-[0.18em] text-white/45">WEATHER</div>
        </div>
      </div>

      <div className="flex-1 space-y-7">
        <NavSection label="Main">
          <SidebarNavItem href="/today" icon={Home} label="Today" />
          <SidebarNavItem href="/forecast" icon={CalendarDays} label="7-Day" />
          <SidebarNavItem href="/locations" icon={MapPin} label="Locations" />
        </NavSection>

        <NavSection label="Preferences">
          <SidebarNavItem href="/settings" icon={SettingsIcon} label="Settings" />
        </NavSection>
      </div>

      <div className="space-y-3">
        <AlertCard />
        <FreeForEveryoneCard />
      </div>
    </aside>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
        {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
