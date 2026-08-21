import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site-url";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsConsent } from "@/components/shell/analytics-consent";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const DESCRIPTION =
  "A local-first weather companion with current conditions and a 14-day outlook for any city. Free for everyone, no sign-up required.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AeroWeather - Local-First Weather Forecasts",
    template: "%s | AeroWeather",
  },
  description: DESCRIPTION,
  applicationName: "AeroWeather",
  openGraph: {
    title: "AeroWeather - Local-First Weather Forecasts",
    description: DESCRIPTION,
    url: "/",
    siteName: "AeroWeather",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AeroWeather - Local-First Weather Forecasts",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-palette="night"
      /* `globals.css` sets `scroll-behavior: smooth` for the single-page
         anchor nav. Next 16 no longer overrides that during a route change
         (it did through 15), so navigating to /settings or /faq animated the
         whole scroll distance instead of jumping - and because the incoming
         route is shorter, the browser clamped the animation part-way and left
         the page a few hundred pixels down, heading under the navbar. This
         attribute opts back into the override: auto during navigation, smooth
         again for in-page anchors. */
      data-scroll-behavior="smooth"
      className={`${poppins.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        {/* Gates the scroll-reveal hidden state so content is never hidden without JS. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
        <Providers>
          {children}
          <Toaster />
          <AnalyticsConsent />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
