"use client";

import Script from "next/script";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  setConsent,
  shouldLoadAnalytics,
  shouldPromptForConsent,
  subscribeConsent,
} from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics is opt-in: nothing loads until the visitor grants consent,
 * and nothing is asked at all unless NEXT_PUBLIC_GA_ID is configured. Vercel
 * Analytics is separate - it is cookieless and carries no identifiers, so it
 * runs without a prompt (disclosed on /privacy).
 */
export function AnalyticsConsent() {
  const choice = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  return (
    <>
      {shouldLoadAnalytics(choice, GA_ID) ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {shouldPromptForConsent(choice, GA_ID) ? (
        <div
          role="dialog"
          aria-label="Analytics consent"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-white/12 bg-[oklch(0.17_0.02_245/0.97)] p-4 shadow-lg backdrop-blur sm:inset-x-6 sm:bottom-6"
        >
          <p className="text-sm leading-relaxed text-foreground/90">
            Can we switch on Google Analytics to see which features get used? It is off
            until you say yes, and the app works exactly the same either way.{" "}
            <Link href="/privacy" className="text-primary underline-offset-2 hover:underline">
              Privacy policy
            </Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConsent("granted")}
              className="glass-pill inline-flex flex-1 items-center justify-center bg-primary/90 py-2 text-sm font-medium text-primary-foreground hover:bg-primary"
            >
              Allow
            </button>
            <button
              type="button"
              onClick={() => setConsent("denied")}
              className="glass-pill inline-flex flex-1 items-center justify-center py-2 text-sm font-medium text-foreground/90 hover:bg-white/[0.14]"
            >
              No thanks
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
