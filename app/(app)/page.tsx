import { TodaySection } from "@/components/sections/today-section";
import { ForecastSection } from "@/components/sections/forecast-section";
import { LocationsSection } from "@/components/sections/locations-section";
import { SettingsSection } from "@/components/sections/settings-section";

/** Single scrolling page: all four areas stacked as anchor-linked sections. */
export default function AppHome() {
  return (
    <div className="space-y-16 md:space-y-20">
      <section id="today" aria-labelledby="today-h" className="scroll-mt-28">
        <TodaySection />
      </section>

      <hr className="border-white/[0.06]" />

      <section id="forecast" aria-labelledby="forecast-h" className="scroll-mt-28">
        <ForecastSection />
      </section>

      <hr className="border-white/[0.06]" />

      <section id="locations" aria-labelledby="locations-h" className="scroll-mt-28">
        <LocationsSection />
      </section>

      <hr className="border-white/[0.06]" />

      <section id="settings" aria-labelledby="settings-h" className="scroll-mt-28">
        <SettingsSection />
      </section>
    </div>
  );
}
