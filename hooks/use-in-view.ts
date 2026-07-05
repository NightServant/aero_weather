"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** Disconnect after the first intersection (default true). */
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
};

/**
 * Scroll-reveal primitive (spec 4). Sets `data-inview` on the element when it
 * intersects; paired with the `data-animate` CSS in globals.css, which only
 * hides content under `html.js`, so SSR/no-JS users always see everything.
 * When IntersectionObserver is unavailable, `inView` stays true.
 */
export function useInView<T extends HTMLElement>(options: Options = {}) {
  const { once = true, threshold = 0.2, rootMargin } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      el.setAttribute("data-inview", "");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            el.setAttribute("data-inview", "");
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
            el.removeAttribute("data-inview");
          }
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return { ref, inView };
}
