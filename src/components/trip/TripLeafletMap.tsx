"use client";

import { useEffect, useRef } from "react";
import type * as LType from "leaflet";
import type { TripStop } from "@/types/trip";
import { isValidCoordinatePair } from "@/lib/google-maps";
import { useLanguage } from "@/components/LanguageProvider";
import { Sparkles } from "lucide-react";

interface TripLeafletMapProps {
  stops: TripStop[];
  selectedStopId: string | null;
  onSelectStop: (stopId: string) => void;
}

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018]; // Bangkok fallback

export default function TripLeafletMap({
  stops,
  selectedStopId,
  onSelectStop,
}: TripLeafletMapProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const markersLayerRef = useRef<LType.LayerGroup | null>(null);
  const polylineRef = useRef<LType.Polyline | null>(null);
  const leafletModuleRef = useRef<typeof LType | null>(null);

  const orderedValidStops = [...stops]
    .filter((s) => isValidCoordinatePair(s.latitude, s.longitude))
    .sort((a, b) => a.sequence - b.sequence);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      const L = await import("leaflet");
      if (!isMounted || !containerRef.current) return;
      leafletModuleRef.current = L;

      const tileUrl =
        process.env.NEXT_PUBLIC_MAP_TILE_URL ||
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      const attribution =
        process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

      const initialCenter: [number, number] =
        orderedValidStops.length > 0
          ? [orderedValidStops[0].latitude, orderedValidStops[0].longitude]
          : DEFAULT_CENTER;

      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: 14,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      renderMapContent(L, map);
    }

    void initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMapContent(L: typeof LType, map: LType.Map) {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (orderedValidStops.length === 0) {
      return;
    }

    const latLngs: [number, number][] = orderedValidStops.map((s) => [
      s.latitude,
      s.longitude,
    ]);

    if (latLngs.length >= 2) {
      polylineRef.current = L.polyline(latLngs, {
        color: "var(--color-brand-primary)",
        weight: 4,
        opacity: 0.9,
        dashArray: "8, 8",
      }).addTo(map);
    }

    orderedValidStops.forEach((stop) => {
      const isSelected = stop.id === selectedStopId;
      const safeName = stop.place_name.replace(/"/g, "&quot;");
      const icon = L.divIcon({
        className: "tamroi-marker-wrapper",
        html: `<div class="tamroi-stop-pin ${
          isSelected ? "tamroi-stop-pin--active" : ""
        }" title="${stop.sequence}. ${safeName}" aria-label="${
          stop.sequence
        }. ${safeName}">${stop.sequence}</div>`,
        iconSize: isSelected ? [46, 46] : [38, 38],
        iconAnchor: isSelected ? [23, 23] : [19, 19],
      });

      const marker = L.marker([stop.latitude, stop.longitude], {
        icon,
        keyboard: true,
        title: `${stop.sequence}. ${stop.place_name}`,
      });

      marker.on("click", () => {
        onSelectStop(stop.id);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }

  useEffect(() => {
    const L = leafletModuleRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    renderMapContent(L, map);

    const activeStop = orderedValidStops.find((s) => s.id === selectedStopId);
    if (activeStop) {
      map.panTo([activeStop.latitude, activeStop.longitude], {
        animate: true,
        duration: 0.4,
      });
    } else if (orderedValidStops.length > 1) {
      const bounds = L.latLngBounds(
        orderedValidStops.map((s) => [s.latitude, s.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [42, 42], maxZoom: 16 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, selectedStopId]);

  useEffect(() => {
    const L = leafletModuleRef.current;
    const map = mapRef.current;
    if (!L || !map || orderedValidStops.length === 0) return;

    if (orderedValidStops.length === 1) {
      map.setView([orderedValidStops[0].latitude, orderedValidStops[0].longitude], 15);
    } else {
      const bounds = L.latLngBounds(
        orderedValidStops.map((s) => [s.latitude, s.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [42, 42], maxZoom: 16 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedValidStops.length]);

  return (
    <div className="cute-card relative h-full w-full overflow-hidden p-2">
      <div
        ref={containerRef}
        className="h-[340px] w-full overflow-hidden rounded-2xl border-2 border-[var(--color-border-subtle)] sm:h-[440px] lg:h-[510px]"
        role="region"
        aria-label={t.detail.mapHeading}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--color-bg-soft)] px-3.5 py-2 text-xs font-medium text-[var(--color-brand-deep)]">
        <div className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 border-b-2 border-dashed border-[var(--color-brand-primary)]" />
          <span>{t.detail.mapLegend(orderedValidStops.length)}</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-sun-yellow-light)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-sun-text)]">
          <Sparkles className="h-3 w-3 text-[var(--color-sun-amber)]" aria-hidden="true" />
          {t.detail.mapClickHint}
        </span>
      </div>
    </div>
  );
}
