"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IconCircleButton } from "@/components/aero/icon-circle-button";
import { SearchTrigger } from "@/components/search/search-trigger";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { usePrefs } from "@/hooks/use-prefs";
import { reverseGeocode } from "@/lib/api/geocoding";
import { addPlace } from "@/lib/prefs";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/today", label: "Today" },
  { href: "/forecast", label: "2-week" },
  { href: "/locations", label: "Locations" },
  { href: "/settings", label: "Settings" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [, setPrefs] = usePrefs();

  // Close the mobile drawer after navigation.
  useEffect(() => setDrawerOpen(false), [pathname]);

  const useMyLocation = () => {
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
  };

  return (
    <header className="sticky top-4 z-40 px-4 md:top-6 md:px-6">
      <nav
        aria-label="Main"
        className="glass-navbar mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 md:px-6"
      >
        <Link href="/today" className="flex items-center gap-2.5 rounded-full">
          <Image src="/brand/aero-logo.svg" alt="" width={36} height={36} priority />
          <span className="text-[17px] font-semibold tracking-tight">
            <span className="text-primary">Aero</span>
            <span className="text-foreground">Weather</span>
          </span>
        </Link>

        {/* Desktop nav pills */}
        <div className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[15px] transition-colors duration-150",
                  active
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <IconCircleButton
            label="Use my location"
            onClick={useMyLocation}
            icon={<MapPin className="size-4" strokeWidth={1.5} />}
          />
          <SearchTrigger className="hidden w-[210px] md:block lg:w-[289px]" />

          {/* Mobile menu */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <span className="md:hidden">
                <IconCircleButton label="Menu" icon={<Menu className="size-4" strokeWidth={1.5} />} />
              </span>
            </DrawerTrigger>
            <DrawerContent aria-label="Menu">
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <div className="space-y-1 px-4 pb-8">
                <SearchTrigger className="mb-3" />
                {NAV_ITEMS.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-12 items-center rounded-xl px-4 text-[15px] transition-colors",
                        active
                          ? "bg-primary/15 font-medium text-primary"
                          : "text-foreground hover:bg-white/[0.06]",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </nav>
    </header>
  );
}
