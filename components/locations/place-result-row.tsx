import { MapPin } from "lucide-react";
import type { Place } from "@/lib/api/types";

type Props = {
  place: Place;
  /** The already-saved match, if any - disables the row and shows "Saved". */
  already: Place | undefined;
  onSelect: (place: Place) => void;
};

/** One geocoding result row: name, region, and a "Saved" badge when the place
 *  is already in the saved list. Shared by the add-city dialog and /search so
 *  the two surfaces present matches identically. */
export function PlaceResultRow({ place, already, onSelect }: Props) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(place)}
        disabled={!!already}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-foreground/[0.04] disabled:cursor-default disabled:opacity-60"
      >
        <MapPin className="size-3.5 shrink-0 opacity-60" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">{place.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {[place.admin1, place.country].filter(Boolean).join(", ")}
          </div>
        </div>
        {already ? (
          <span className="shrink-0 pl-2 text-[10px] font-semibold tracking-wider uppercase text-foreground/55">
            Saved
          </span>
        ) : null}
      </button>
    </li>
  );
}
