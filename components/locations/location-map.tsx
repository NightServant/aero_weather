"use client";

import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";

type Props = { lat: number; lon: number; name: string };

const SAT_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

/** Satellite-only Leaflet map that fills its (relative) parent, edge to edge and
 *  without a border radius. Used in the location details dialog's right pane. */
export default function LocationMap({ lat, lon, name }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let disposed = false;

    import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return;
      map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView([lat, lon], 11);

      L.tileLayer(SAT_URL, { maxZoom: 19, attribution: "© Esri" }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:var(--primary,#3b82f6);box-shadow:0 0 0 4px rgba(59,130,246,0.35);"></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([lat, lon], { icon, title: name }).addTo(map);
      // Leaflet needs a size recalc once its container becomes visible in the dialog.
      setTimeout(() => map?.invalidateSize(), 0);
    });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [lat, lon, name]);

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label={`Satellite map showing ${name}`}
        role="img"
      />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-[500] inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition-colors duration-150 hover:bg-black/75"
      >
        <ExternalLink className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        Open in Google Maps
      </a>
    </div>
  );
}
