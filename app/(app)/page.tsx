import { AppSections } from "@/components/sections/app-sections";
import { HashScroll } from "@/components/shell/hash-scroll";

/** Single scrolling page: Today, 2-week, and Locations stacked as anchor-linked
 *  sections. Settings and FAQ live at their own routes (`/settings`, `/faq`). */
export default function AppHome() {
  return (
    <>
      <HashScroll />
      <AppSections />
    </>
  );
}
