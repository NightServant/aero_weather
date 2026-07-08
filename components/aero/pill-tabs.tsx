"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Tab = { value: string; label: string };

type Props = {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
  /** When set, tabs get `aria-controls="{panelIdPrefix}-{value}"`; give the
   *  matching panel `id` + `role="tabpanel"` + `aria-labelledby="{panelIdPrefix}-tab-{value}"`. */
  panelIdPrefix?: string;
  /** Track surface: translucent `glass` (default) or the more opaque, readable `tint`. */
  surface?: "glass" | "tint";
  className?: string;
};

/**
 * Design pill tab group (spec 2 `.glass-pill`, spec 4 sliding thumb, spec 7
 * tab semantics). Full tablist keyboard support: Left/Right/Home/End with
 * roving tabindex; selection follows focus.
 */
export function PillTabs({ tabs, value, onValueChange, ariaLabel, panelIdPrefix, surface = "glass", className }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(`[data-value="${CSS.escape(value)}"]`);
    if (!active) return;
    setThumb({ left: active.offsetLeft, width: active.offsetWidth });
  }, [value]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((t) => t.value === value);
    let next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === -1) return;
    e.preventDefault();
    onValueChange(tabs[next].value);
    listRef.current
      ?.querySelector<HTMLElement>(`[data-value="${CSS.escape(tabs[next].value)}"]`)
      ?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-flex items-center rounded-full p-1",
        surface === "tint" ? "tint-card !rounded-full" : "glass-pill",
        className,
      )}
    >
      {/* Sliding thumb (presentational). */}
      {thumb ? (
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-full bg-white/12 transition-transform duration-[240ms]"
          style={{
            transitionTimingFunction: "var(--ease-out-quart)",
            transform: `translateX(${thumb.left}px)`,
            width: thumb.width,
            left: 0,
            willChange: "transform",
          }}
        />
      ) : null}
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            data-value={tab.value}
            id={panelIdPrefix ? `${panelIdPrefix}-tab-${tab.value}` : undefined}
            aria-controls={panelIdPrefix ? `${panelIdPrefix}-${tab.value}` : undefined}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              // 30px visual height, 44px hit area via negative-margin padding (spec 7).
              "relative z-10 -my-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-150 active:scale-[0.98]",
              selected ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
