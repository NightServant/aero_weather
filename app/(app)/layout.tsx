import type { ReactNode } from "react";
import { Navbar } from "@/components/shell/navbar";
import { SiteFooter } from "@/components/shell/site-footer";
import { SkyBackground } from "@/components/shell/sky-background";
import { ActiveForecastProvider } from "@/components/shell/active-forecast-context";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ActiveForecastProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="relative flex min-h-[100dvh] flex-col">
        <SkyBackground />
        <Navbar />
        <main id="main" className="mx-auto w-full max-w-[1188px] flex-1 px-6 pb-16 pt-8 md:pt-10">
          {children}
        </main>
        <SiteFooter />
      </div>
    </ActiveForecastProvider>
  );
}
