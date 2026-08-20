import type { Metadata } from "next";
import { FaqSection } from "@/components/sections/faq-section";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about AeroWeather: data sources, accounts, saved cities, and location lookup.",
};

export default function FaqPage() {
  return <FaqSection />;
}
