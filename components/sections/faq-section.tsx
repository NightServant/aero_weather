import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "./section-header";

/** Answers are drawn from the documented behaviour in README.md - keep them in
 *  sync if the data sources or storage model change. */
const FAQ = [
  {
    q: "Do I need an account to use AeroWeather?",
    a: "No. There is no sign-up, no login, and no premium tier. Every feature is available the moment the page loads.",
  },
  {
    q: "Where does the weather data come from?",
    a: "Forecasts, air quality, and city search all come from Open-Meteo's free public APIs. Reverse geocoding uses BigDataCloud, and city descriptions and photos come from Wikipedia and Wikimedia Commons.",
  },
  {
    q: "Why is the outlook 14 days and not a full month?",
    a: "Open-Meteo publishes up to 16 days of daily forecast, and accuracy drops sharply past two weeks. AeroWeather shows 14 days rather than padding the view with numbers that are not meaningful.",
  },
  {
    q: "Where are my saved cities stored?",
    a: "Only in this browser, under a single localStorage key. Nothing is sent to a server we control, so clearing site data, switching browsers, or using a private window starts you fresh.",
  },
  {
    q: "Why did \"Use my location\" pick the wrong city?",
    a: "It uses your browser's coarse location with an 8 second timeout, then resolves the nearest known place. Indoors or on a VPN that can land on a neighbouring city. You can always search for the exact one instead.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-h" className="mt-16 scroll-mt-28 md:mt-20">
      <SectionHeader id="faq-h" kicker="Questions" title="Frequently asked" />
      <Accordion type="single" collapsible className="mt-6 max-w-3xl">
        {FAQ.map(({ q, a }) => (
          <AccordionItem key={q} value={q} className="border-white/[0.08]">
            <AccordionTrigger className="text-left text-[15px] font-medium">
              {q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-text-mid">
              {a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
