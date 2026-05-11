import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { ActiveForecastProvider } from "@/components/shell/active-forecast-context";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ActiveForecastProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <div className="flex-1 px-10 pb-16">{children}</div>
        </main>
      </div>
    </ActiveForecastProvider>
  );
}
