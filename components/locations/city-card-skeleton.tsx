import { cn } from "@/lib/utils";

/**
 * Shape-matched placeholder for one city card (spec 7: skeletons match the
 * final layout, no spinners). Render inside an `aria-busy` container.
 */
export function CityCardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("tint-card relative w-full p-4", className)}>
      <div className="h-[160px] w-full animate-pulse rounded-[12px] bg-white/10" />
      {/* Details (info) button placeholder — pinned like the real card. */}
      <div className="absolute top-6 right-6 size-9 animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/10" />
      <div className="mt-3 flex items-center gap-2">
        <div className="size-5 shrink-0 animate-pulse rounded-full bg-white/10" />
        <div className="h-5 w-14 animate-pulse rounded bg-white/10" />
        <div className="ml-auto h-3 w-16 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

/** Fallback row shown while the lazy carousel bundle loads. */
export function CarouselSkeletonRow() {
  return (
    <div aria-busy="true" className="flex gap-6 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <CityCardSkeleton key={i} className="w-[78vw] shrink-0 sm:w-[240px]" />
      ))}
    </div>
  );
}
