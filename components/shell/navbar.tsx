"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Menu } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { SearchTrigger } from "@/components/search/search-trigger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePrefs } from "@/hooks/use-prefs";
import { reverseGeocode } from "@/lib/api/geocoding";
import { addPlace } from "@/lib/prefs";
import { pickActiveSection, visibleSectionIds, type SectionBox } from "@/lib/sections";
import { USE_LOCATION_EVENT } from "@/lib/ui-events";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "today", href: "#today", label: "Today" },
  { id: "forecast", href: "#forecast", label: "2-week" },
  { id: "locations", href: "#locations", label: "Locations" },
  { id: "settings", href: "#settings", label: "Settings" },
] as const;

/** Real routes, not in-page anchors: never scroll-spied, matched on pathname. */
const ROUTE_ITEMS = [{ href: "/privacy", label: "Privacy" }] as const;

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("today");
  const [prefs, setPrefs, hydrated] = usePrefs();
  const pathname = usePathname();

  const visibleIds = visibleSectionIds(!hydrated || prefs.locations.length > 0);
  const onHome = pathname === "/";
  const navItems = [
    ...NAV_ITEMS.filter((item) => visibleIds.includes(item.id)).map((item) => ({
      key: item.id,
      label: item.label,
      href: onHome ? item.href : `/${item.href}`,
      active: onHome && activeId === item.id,
    })),
    ...ROUTE_ITEMS.map((item) => ({
      key: item.href,
      label: item.label,
      href: item.href,
      active: pathname === item.href,
    })),
  ];

  // Scroll-spy. Measuring on scroll is deterministic: an IntersectionObserver
  // over a mid-viewport band only fired while crossing it, so the highlight
  // lagged, and a short final section never reached the band at all.
  useEffect(() => {
    if (!onHome) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const boxes: SectionBox[] = [];
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) boxes.push({ id: item.id, top: el.getBoundingClientRect().top + window.scrollY });
      }
      const next = pickActiveSection(
        boxes,
        window.scrollY,
        window.innerHeight,
        document.documentElement.scrollHeight,
      );
      if (next) setActiveId(next);
    };

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Sections mount and grow as prefs hydrate and forecasts load, which moves
    // every offset measured above.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [onHome]);

  const useMyLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported in this browser.");
      return;
    }
    toast.loading("Finding your location…", { id: "geo" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const place = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (!place) {
            toast.error("Couldn't identify your location.", { id: "geo" });
            return;
          }
          setPrefs((p) => {
            const { list, id } = addPlace(p.locations, place);
            return { ...p, locations: list, activeLocationId: id };
          });
          toast.success(`Located: ${place.name}`, { id: "geo" });
        } catch {
          toast.error("Location lookup failed.", { id: "geo" });
        }
      },
      () => toast.error("Location permission denied.", { id: "geo" }),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [setPrefs]);

  // Lets the footer's "Use my location" link run this handler.
  useEffect(() => {
    window.addEventListener(USE_LOCATION_EVENT, useMyLocation);
    return () => window.removeEventListener(USE_LOCATION_EVENT, useMyLocation);
  }, [useMyLocation]);

  return (
    <header className="sticky top-4 z-40 px-4 md:top-6 md:px-6">
      {/* Desktop has room to show where you can go, so it does: the links sit
          in the bar and the search takes a fixed slot beside them. Below lg
          there is no such room, so the links collapse behind one menu and the
          search spreads into the space they left. */}
      <nav
        aria-label="Main"
        className="tint-card backdrop-blur mx-auto flex h-16 max-w-[1200px] items-center gap-2 px-3 sm:gap-3 sm:px-4 md:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]"
      >
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href={onHome ? "#today" : "/"} className="flex shrink-0 items-center gap-2.5 rounded-full">
            <Image src="/brand/aero-logo.svg" alt="" width={36} height={36} priority />
            <span className="hidden text-[17px] font-semibold tracking-tight sm:inline">
              <span className="text-primary">Aero</span>
              <span className="text-foreground">Weather</span>
            </span>
          </Link>
          <IconCircleButton
            label="Use my location"
            onClick={useMyLocation}
            icon={<MapPin className="size-4" strokeWidth={1.5} />}
            className="max-[359px]:hidden"
          />
        </div>

        <div className="hidden items-center lg:flex lg:justify-self-center">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-2 text-[15px] transition-colors duration-150",
                item.active
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-none lg:justify-self-end">
          <SearchTrigger className="mx-auto w-full min-w-0 max-w-[560px] lg:mx-0 lg:w-[360px] lg:max-w-none lg:shrink-0" />
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <IconCircleButton
              label="Menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              icon={<Menu className="size-4" strokeWidth={1.5} />}
              className="lg:hidden"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-56 border-white/12"
            style={{ background: "oklch(0.17 0.02 245 / 0.97)" }}
          >
            {navItems.map((item) => (
              <DropdownMenuItem key={item.key} asChild>
                <Link
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "flex h-10 cursor-pointer items-center rounded-lg px-3 text-[15px]",
                    item.active ? "font-medium text-primary" : "text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
