"use client";

import { useEffect } from "react";

/** How long to keep looking for a section that has not mounted yet. */
const FIND_TIMEOUT = 5000;
const FIND_TICK = 200;
/** Discrete re-checks after the first jump, to absorb late layout shift. */
const CORRECTION_DELAYS = [400, 1200];

/**
 * Scrolls to the URL hash once its section exists.
 *
 * The browser's native anchor handling misses here: arriving from another route
 * (/privacy -> /#forecast) the anchor does not exist yet, because the sections
 * only mount after prefs hydrate. Once mounted, forecast data replaces
 * skeletons and shifts the page, so the landing offset needs a couple of
 * corrections - kept to two discrete passes rather than a loop, since a tight
 * re-scroll interval fights the global `scroll-behavior: smooth`.
 */
export function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    // A plain reload deep in the page is already positioned; leave it alone.
    if (document.getElementById(id) && window.scrollY > 0) return;

    const timers: number[] = [];
    const startedAt = Date.now();

    // Jump without animation: the target can be thousands of pixels away and a
    // smooth scroll over shifting content gets cancelled part-way.
    const jump = (el: HTMLElement) => {
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      el.scrollIntoView({ block: "start" });
      root.style.scrollBehavior = previous;
    };

    const find = () => {
      const el = document.getElementById(id);
      if (el) {
        jump(el);
        for (const delay of CORRECTION_DELAYS) {
          timers.push(
            window.setTimeout(() => {
              const target = document.getElementById(id);
              if (target) jump(target);
            }, delay),
          );
        }
        return;
      }
      if (Date.now() - startedAt < FIND_TIMEOUT) {
        timers.push(window.setTimeout(find, FIND_TICK));
      }
    };

    find();
    return () => timers.forEach(window.clearTimeout);
  }, []);

  // A same-route hash change (Next rewrites "/#forecast" while already on "/")
  // does not remount this component and does not always scroll natively.
  useEffect(() => {
    const onHashChange = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: "start" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
