"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";

type Props = { lat: number; lon: number; name: string };

const OSM_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const SAT_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export default function LocationMap({ lat, lon, name }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [satellite, setSatellite] = useState(true);
  // Hold Leaflet map + the two tile layers across renders.
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<{ street: import("leaflet").TileLayer; sat: import("leaflet").TileLayer } | null>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let disposed = false;

    import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return;
      map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView([lat, lon], 11);
      mapRef.current = map;

      const street = L.tileLayer(OSM_URL, { maxZoom: 19, attribution: "© OpenStreetMap" });
      const sat = L.tileLayer(SAT_URL, { maxZoom: 19, attribution: "© Esri" });
      layersRef.current = { street, sat };
      sat.addTo(map);

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
      mapRef.current = null;
      layersRef.current = null;
    };
  }, [lat, lon, name]);

  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;
    if (satellite) {
      map.removeLayer(layers.street);
      layers.sat.addTo(map);
    } else {
      map.removeLayer(layers.sat);
      layers.street.addTo(map);
    }
  }, [satellite]);

  return (
    <div className="relative isolate">
      <div
        ref={containerRef}
        className="h-56 w-full overflow-hidden rounded-xl border border-white/12 sm:h-64"
        aria-label={`Map showing ${name}`}
        role="img"
      />
      <button
        type="button"
        onClick={() => setSatellite((s) => !s)}
        className="glass-pill absolute top-3 right-3 z-[500] px-3 py-1 text-xs font-medium text-foreground/90 hover:bg-white/[0.14]"
      >
        {satellite ? "Standard" : "Satellite"}
      </button>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-pill absolute bottom-3 right-3 z-[500] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground/90 hover:bg-white/[0.14]"
      >
        <ExternalLink className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        Open in Google Maps
      </a>
    </div>
  );
}
