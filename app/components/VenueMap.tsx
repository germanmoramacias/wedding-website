"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  useMap,
} from "@/components/ui/map";
import { MapPin } from "lucide-react";
import { useEffect } from "react";

const VENUE_CENTER: [number, number] = [-1.19156, 38.088364];
const IVORY_DEEP = "#eee7da";

function IvoryMapTheme() {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    for (const layer of map.getStyle().layers ?? []) {
      const layerName = layer.id.toLowerCase();

      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", IVORY_DEEP);
      }

      if (layer.type === "fill") {
        const fillColor = layerName.includes("water")
          ? "#e2ddd2"
          : layerName.includes("building")
            ? "#ddd4c6"
            : layerName.includes("park") || layerName.includes("landcover")
              ? "#e5e1d4"
              : IVORY_DEEP;

        map.setPaintProperty(layer.id, "fill-color", fillColor);
      }

      if (layer.type === "line") {
        const lineColor = layerName.includes("road")
          ? "#d2c7b6"
          : layerName.includes("water")
            ? "#cbc5b9"
            : "#c8bead";

        map.setPaintProperty(layer.id, "line-color", lineColor);
      }

      if (layer.type === "symbol") {
        map.setPaintProperty(layer.id, "text-color", "#81796d");
        map.setPaintProperty(layer.id, "text-halo-color", IVORY_DEEP);
        map.setPaintProperty(layer.id, "text-halo-width", 1.15);
      }
    }
  }, [isLoaded, map]);

  return null;
}

export function VenueMap() {
  return (
    <div className="venue-map">
      <Map center={VENUE_CENTER} zoom={14} theme="light">
        <IvoryMapTheme />
        <MapMarker
          longitude={VENUE_CENTER[0]}
          latitude={VENUE_CENTER[1]}
          anchor="bottom"
        >
          <MarkerContent>
            <span className="venue-map__marker" role="img" aria-label="Molina Real">
              <MapPin aria-hidden="true" />
            </span>
            <MarkerLabel className="venue-map__marker-label">Molina Real</MarkerLabel>
          </MarkerContent>
        </MapMarker>
        <MapControls position="top-right" />
      </Map>
    </div>
  );
}
