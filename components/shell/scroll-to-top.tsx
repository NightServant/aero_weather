"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Lands every route change at the top of the page.
 *
 * Next decides whether to scroll on navigation by asking whether the top of
 * the incoming content is already in the viewport. That check misreads this
 * layout twice over. The browser carries the previous scroll offset across a
 * client-side navigation and clamps it to the new page's maximum, so arriving
 * on a short route from deep in the single-page scroll leaves a residual
 * offset - 176px on /faq at a 840px viewport. At that offset the section's top
 * edge is a few pixels below the viewport top, so the check passes and no
 * scroll happens, but the sticky navbar covers the first 88px, so the kicker
 * and heading sit behind it. /settings and /privacy escape it only by being
 * tall enough that the clamped offset pushes their content out of view.
 *
 * A hash is somebody else's business: `HashScroll` and the browser's own
 * anchor handling own that case, and stealing it here would undo their work.
 *
 * Back and forward navigation is left alone so the reader returns to where
 * they were in the long scroll. `popstate` fires before the new pathname
 * reaches React, so the flag is already set by the time the effect runs.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const popped = useRef(false);

  useEffect(() => {
    const onPop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (popped.current) {
      popped.current = false;
      return;
    }
    if (window.location.hash) return;

    // Instant, not animated: this is a landing position, not a journey. The
    // global `scroll-behavior: smooth` would otherwise play the whole distance.
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  }, [pathname]);

  return null;
}
