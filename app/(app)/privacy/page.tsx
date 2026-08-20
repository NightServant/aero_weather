import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What AeroWeather stores on your device, which third parties receive a request when you use it, and how to erase everything.",
};

const UPDATED = "19 August 2026";

/** Third parties that receive a direct request from the visitor's browser.
 *  Each entry must name what actually reaches them - see lib/api/. */
const THIRD_PARTIES = [
  {
    name: "Open-Meteo",
    href: "https://open-meteo.com/en/terms",
    what: "City name you type when searching, and the coordinates of any city you view. Receives your IP address as the requesting browser.",
  },
  {
    name: "BigDataCloud",
    href: "https://www.bigdatacloud.com/privacy-and-cookie-policy",
    what: "Only used for \"Use my location\". Receives the latitude and longitude your browser reports, plus your IP address.",
  },
  {
    name: "Wikipedia / Wikimedia Commons",
    href: "https://foundation.wikimedia.org/wiki/Policy:Privacy_policy",
    what: "Name of a city whose details dialog you open, in order to fetch its description and photos. Receives your IP address.",
  },
];

/** Section order, used for both the headings and the contents list beside them. */
const SECTIONS = [
  "The short version",
  "What is stored on your device",
  "Who else receives a request",
  "Location",
  "Analytics",
  "Artificial intelligence",
  "Erasing your data",
  "Children",
] as const;

const slug = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, "-");

function H2({ children }: { children: string }) {
  return (
    <h2 id={slug(children)} className="text-headline mt-10 mb-3 scroll-mt-24 text-[1.35rem]">
      {children}
    </h2>
  );
}

export default function PrivacyPage() {
  return (
    <div className="pb-8 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <header className="lg:sticky lg:top-28">
        <p className="kicker">Privacy</p>
        <h1 className="text-headline mt-3">Privacy policy</h1>
        <p className="text-subtitle mt-2">Last updated {UPDATED}.</p>

        <nav aria-label="Sections" className="mt-6 hidden lg:block">
          <ul className="space-y-1.5">
            {SECTIONS.map((label) => (
              <li key={label}>
                <a
                  href={`#${slug(label)}`}
                  className="text-sm text-text-mid transition-colors duration-150 hover:text-foreground"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <article className="max-w-[68ch] lg:mt-0">
      <H2>The short version</H2>
      <p className="text-sm leading-relaxed text-text-mid">
        AeroWeather has no backend of its own, no accounts, and no advertising. We do not
        run a server that stores anything about you. Your settings and saved cities live
        in this browser only. Using the app does, however, send requests directly from
        your browser to the weather and reference services listed below, and those
        services can see your IP address. Anonymous, cookieless page-view counts are
        collected; Google Analytics stays off unless you opt in.
      </p>

      <H2>What is stored on your device</H2>
      <p className="text-sm leading-relaxed text-text-mid">
        A single <code className="rounded bg-white/10 px-1 py-0.5 text-[0.8em]">localStorage</code>{" "}
        entry holds your saved cities, which one is active, your unit and time-format
        choices, and your notification toggles. It never leaves your device. There are no
        cookies, and no tracking or advertising pixels.
      </p>

      <H2>Who else receives a request</H2>
      <p className="text-sm leading-relaxed text-text-mid">
        These requests go straight from your browser to each provider, so each one
        necessarily sees your IP address and can log it under its own policy. We receive
        no copy of any of it.
      </p>
      <ul className="mt-4 space-y-4">
        {THIRD_PARTIES.map((p) => (
          <li key={p.name} className="border-l border-white/12 pl-4">
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              {p.name}
            </a>
            <p className="caption mt-1 leading-relaxed">{p.what}</p>
          </li>
        ))}
      </ul>

      <H2>Location</H2>
      <p className="text-sm leading-relaxed text-text-mid">
        &quot;Use my location&quot; asks your browser for permission first, and nothing is
        requested until you grant it. The coordinates are used once to resolve a nearby
        place name, then discarded. Denying permission leaves the rest of the app fully
        usable.
      </p>

      <H2>Analytics</H2>
      <p className="text-sm leading-relaxed text-text-mid">
        <strong className="font-medium text-foreground">Vercel Analytics</strong> records
        anonymous page views to show which parts of the app get used. It sets no cookies,
        assigns you no identifier, and cannot follow you to other sites, so it runs without
        asking. See{" "}
        <a
          href="https://vercel.com/docs/analytics/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline"
        >
          Vercel&apos;s analytics privacy policy
        </a>
        .
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-mid">
        <strong className="font-medium text-foreground">Google Analytics</strong> is
        opt-in. Nothing from Google loads unless you press Allow on the consent prompt, and
        choosing No thanks keeps it off permanently on this device. Clearing your browser
        storage resets that choice, so you will be asked once more.
      </p>

      <H2>Artificial intelligence</H2>
      <p className="text-sm leading-relaxed text-text-mid">
        AeroWeather does not use AI to generate, personalise, or process anything you see.
        Forecast summaries are written from the numeric forecast by fixed rules in the
        app&apos;s own code.
      </p>

      <H2>Erasing your data</H2>
      <p className="text-sm leading-relaxed text-text-mid">
        Clearing this site&apos;s browser storage deletes everything AeroWeather has saved,
        immediately and permanently. There is no account to close and nothing of yours held
        anywhere else. Requests already made to the providers above are governed by their
        policies.
      </p>

      <H2>Children</H2>
      <p className="text-sm leading-relaxed text-text-mid">
        AeroWeather collects no personal information from anyone, including children.
      </p>

      <p className="mt-10">
        <Link
          href="/"
          className="glass-pill inline-flex items-center px-5 py-2.5 text-sm font-medium"
        >
          Back to the forecast
        </Link>
      </p>
      </article>
    </div>
  );
}
