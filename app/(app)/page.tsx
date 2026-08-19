import { AppSections } from "@/components/sections/app-sections";
import { FaqSection } from "@/components/sections/faq-section";
import { HashScroll } from "@/components/shell/hash-scroll";

/** Single scrolling page: all four areas stacked as anchor-linked sections. */
export default function AppHome() {
  return (
    <>
      <HashScroll />
      <AppSections />
      <FaqSection />
    </>
  );
}
