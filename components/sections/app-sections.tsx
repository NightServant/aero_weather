"use client";

import { TodaySection } from "@/components/sections/today-section";
import { ForecastSection } from "@/components/sections/forecast-section";
import { LocationsSection } from "@/components/sections/locations-section";
import { EmptyLocation } from "@/components/shell/empty-location";
import { usePrefs } from "@/hooks/use-prefs";

function Divider() {
  return <hr className="border-white/[0.06]" />;
}

/**
 * Single-page composition. Owns the "no saved location" decision so the welcome
 * prompt renders exactly ONCE — previously Today, 2-week, and Locations each
 * rendered their own <EmptyLocation/>, stacking three copies. Settings and FAQ
 * live at their own routes (`/settings`, `/faq`), not in this scroll, so the
 * empty state is just the welcome prompt.
 */
export function AppSections() {
  const [prefs, , hydrated] = usePrefs();
  const hasLocation = prefs.locations.length > 0;

  // Only branch to the empty state once hydrated — while `!hydrated`, prefs are
  // the (empty) defaults, so fall through to the sections, which show skeletons.
  if (hydrated && !hasLocation) {
    return (
      <div className="space-y-16 md:space-y-20">
        <section id="today" aria-labelledby="today-h" className="scroll-mt-28">
          <EmptyLocation />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-16 md:space-y-20">
      <section id="today" aria-labelledby="today-h" className="scroll-mt-28">
        <TodaySection />
      </section>

      <Divider />

      <section id="forecast" aria-labelledby="forecast-h" className="scroll-mt-28">
        <ForecastSection />
      </section>

      <Divider />

      <section id="locations" aria-labelledby="locations-h" className="scroll-mt-28">
        <LocationsSection />
      </section>
    </div>
  );
}
