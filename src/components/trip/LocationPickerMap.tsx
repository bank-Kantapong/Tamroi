"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type * as LType from "leaflet";
import { Search, MapPin, Loader2, Navigation, AlertCircle, Info } from "lucide-react";

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  placeName?: string;
  className?: string;
}

interface SearchResultItem {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  isNearbyArea?: boolean;
}

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018]; // Bangkok

function cleanSearchQuery(raw: string): string {
  return raw
    .replace(/(?:ที่อยู่(?:ที่|ตรง)?|อยู่ที่|ตั้งอยู่ที่|ตรงข้าม|ตรง|แถว|ใกล้|ย่าน|ร้าน|คาเฟ่)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLocationKeywords(raw: string): string[] {
  const words = raw.split(/\s+/).filter(Boolean);
  const candidates: string[] = [];

  const roadMatch = raw.match(
    /(?:ถนน|ซอย|แขวง|เขต|อำเภอ|ตำบล|ย่าน|บรรทัดทอง|สยาม|สุขุมวิท|สีลม|เยาวราช|อารีย์|บางรัก|พระนคร|จตุจักร|ลาดพร้าว|ทองหล่อ|เอกมัย)[^\s,]*/i
  );
  if (roadMatch) {
    candidates.push(roadMatch[0]);
  }

  if (words.length > 1) {
    // Add the last word if it looks like a location (e.g. "บรรทัดทอง")
    const last = words[words.length - 1];
    if (last.length >= 3 && !candidates.includes(last)) {
      candidates.push(last);
    }
  }

  return candidates;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onChange,
  placeName = "",
  className = "",
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const markerRef = useRef<LType.Marker | null>(null);
  const leafletModuleRef = useRef<typeof LType | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Determine current effective coordinates
  const currentLat =
    latitude !== null && !isNaN(latitude) ? latitude : DEFAULT_CENTER[0];
  const currentLng =
    longitude !== null && !isNaN(longitude) ? longitude : DEFAULT_CENTER[1];
  const hasUserPinned =
    latitude !== null &&
    longitude !== null &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!containerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");
      if (!isMounted || !containerRef.current) return;
      leafletModuleRef.current = L;

      const tileUrl =
        process.env.NEXT_PUBLIC_MAP_TILE_URL ||
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
      const attribution =
        process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OSM</a>';

      const map = L.map(containerRef.current, {
        center: [currentLat, currentLng],
        zoom: hasUserPinned ? 15 : 12,
        scrollWheelZoom: true,
      });

      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Icon
      const pinIcon = L.divIcon({
        className: "custom-location-pin",
        html: `
          <div style="position: relative; width: 32px; height: 42px; transform: translate(-16px, -42px);">
            <svg viewBox="0 0 32 42" width="32" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 14.4 24.6 15.02 25.17a1.49 1.49 0 0 0 1.96 0C17.6 40.6 32 27.2 32 16 32 7.163 24.837 0 16 0z" fill="#0D9488" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
            </svg>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      });

      // Draggable Marker
      const marker = L.marker([currentLat, currentLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const lat = Number(pos.lat.toFixed(6));
        const lng = Number(pos.lng.toFixed(6));
        onChange(lat, lng);
      });

      // Map Click to Pin
      map.on("click", (e: LType.LeafletMouseEvent) => {
        const lat = Number(e.latlng.lat.toFixed(6));
        const lng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([lat, lng]);
        onChange(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    void initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position if external lat/lng changes
  useEffect(() => {
    if (markerRef.current && hasUserPinned) {
      markerRef.current.setLatLng([latitude!, longitude!]);
      mapInstanceRef.current?.panTo([latitude!, longitude!]);
    }
  }, [latitude, longitude, hasUserPinned]);

  // Search places via Nominatim + Fallbacks
  const handleSearch = useCallback(async () => {
    const rawQ = searchQuery.trim() || placeName.trim();
    if (!rawQ) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchNotice(null);
    setSearchResults([]);

    const cleanedQ = cleanSearchQuery(rawQ);

    async function queryNominatim(term: string): Promise<SearchResultItem[]> {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          term
        )}&countrycodes=th&limit=5`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "th,en" },
        });
        if (!res.ok) return [];
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((item: { place_id: number; display_name: string; lat: string; lon: string }) => ({
            place_id: item.place_id,
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
          }));
        }
      } catch {
        // Continue
      }
      return [];
    }

    async function queryPhoton(term: string): Promise<SearchResultItem[]> {
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          term
        )}&lat=${currentLat}&lon=${currentLng}&limit=5`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        if (data?.features && Array.isArray(data.features)) {
          return data.features.map(
            (f: {
              properties: { osm_id?: number; name?: string; street?: string; district?: string; city?: string };
              geometry: { coordinates: [number, number] };
            }, idx: number) => {
              const name = f.properties.name || f.properties.street || "";
              const area = [f.properties.district, f.properties.city].filter(Boolean).join(", ");
              return {
                place_id: f.properties.osm_id || idx + 9999,
                display_name: area ? `${name} (${area})` : name,
                lat: String(f.geometry.coordinates[1]),
                lon: String(f.geometry.coordinates[0]),
              };
            }
          ).filter((item: SearchResultItem) => Boolean(item.display_name));
        }
      } catch {
        // Continue
      }
      return [];
    }

    try {
      // 1. Try original query
      let results = await queryNominatim(rawQ);

      // 2. Try cleaned query without conversational prefixes (e.g. "ที่อยู่ที่", "ร้าน")
      if (results.length === 0 && cleanedQ !== rawQ) {
        results = await queryNominatim(cleanedQ);
      }

      // 3. Try Photon fuzzy search
      if (results.length === 0) {
        results = await queryPhoton(cleanedQ || rawQ);
      }

      // 4. Try road / area keyword fallback (e.g. "บรรทัดทอง")
      if (results.length === 0) {
        const areaKeywords = extractLocationKeywords(rawQ);
        for (const kw of areaKeywords) {
          const areaResults = await queryNominatim(kw);
          if (areaResults.length > 0) {
            results = areaResults.map((r) => ({
              ...r,
              isNearbyArea: true,
              display_name: `${r.display_name.split(",")[0]} (ย่าน/ถนนใกล้เคียง)`,
            }));
            setSearchNotice(
              `💡 ไม่พบชื่อร้านโดยตรงใน OpenStreetMap (ร้านเปิดใหม่อาจยังไม่มีในแผนที่สาธารณะ) จึงค้นหาบริเวณ "${kw}" ให้ คุณสามารถคลิกเลือกเพื่อเลื่อนแผนที่แล้วคลิกปักหมุดตำแหน่งร้านได้เลยครับ`
            );
            break;
          }
        }
      }

      if (results.length > 0) {
        setSearchResults(results);
      } else {
        setSearchError(
          "ไม่พบสถานที่นี้ใน OpenStreetMap แนะนำให้ลองค้นหาชื่อถนนหรือย่าน เช่น 'ถนนบรรทัดทอง' หรือคลิกปักหมุดบนแผนที่ได้เลยครับ"
        );
      }
    } catch {
      setSearchError("ไม่สามารถเชื่อมต่อบริการค้นหาพิกัดได้");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, placeName, currentLat, currentLng]);

  function handleSelectResult(item: SearchResultItem) {
    const lat = Number(Number(item.lat).toFixed(6));
    const lng = Number(Number(item.lon).toFixed(6));

    onChange(lat, lng);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 16);
    }

    setSearchResults([]);
    setSearchQuery(item.display_name.split(",")[0]);
  }

  // Geolocation
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setSearchError("เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง GPS");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeolocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onChange(lat, lng);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 16);
        }
      },
      () => {
        setIsGeolocating(false);
        setSearchError("ไม่สามารถเข้าถึงตำแหน่ง GPS ของคุณได้");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Search Bar + Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="ค้นหาชื่อสถานที่ เช่น ถนนบรรทัดทอง, วัดพระแก้ว..."
            className="cute-input w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-slate-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl shadow-xs"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="cute-btn cute-btn-secondary inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-black shadow-xs rounded-xl"
          >
            {isSearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" />
            )}
            <span>ค้นหา</span>
          </button>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGeolocating}
            title="ใช้ตำแหน่งปัจจุบันของฉัน"
            className="cute-btn inline-flex items-center justify-center gap-1 border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-2 px-2.5 text-xs font-bold rounded-xl shadow-xs"
          >
            {isGeolocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-brand-primary)]" />
            ) : (
              <Navigation className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" />
            )}
            <span className="hidden md:inline">ตำแหน่งฉัน</span>
          </button>
        </div>
      </div>

      {/* Helpful Fallback Area Notice */}
      {searchNotice && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-[11px] font-medium text-amber-900 animate-fade-up">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{searchNotice}</span>
        </div>
      )}

      {/* Autocomplete Search Results */}
      {searchResults.length > 0 && (
        <div className="rounded-xl border-2 border-teal-200 bg-white p-1.5 shadow-lg animate-fade-up max-h-48 overflow-y-auto divide-y divide-slate-100">
          <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            ผลการค้นหาสถานที่ (คลิกเพื่อเลื่อนหมุดไปยังจุดนี้)
          </div>
          {searchResults.map((item) => (
            <button
              key={item.place_id}
              type="button"
              onClick={() => handleSelectResult(item)}
              className="w-full flex items-start gap-2 p-2 text-left text-xs font-bold text-slate-700 hover:bg-teal-50 rounded-lg transition"
            >
              <MapPin className="h-4 w-4 shrink-0 text-[var(--color-brand-primary)] mt-0.5" />
              <span className="truncate">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {searchError && (
        <p className="flex items-start gap-1.5 text-xs font-bold text-rose-600 animate-fade-up">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{searchError}</span>
        </p>
      )}

      {/* Leaflet Map Canvas */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-300 shadow-sm bg-slate-100">
        <div
          ref={containerRef}
          className="h-[240px] w-full z-0 cursor-crosshair"
          tabIndex={0}
          aria-label="Map to pick coordinates"
        />

        {/* Pinned Coordinates Overlay Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-700/30 bg-teal-900/85 px-3 py-1 text-[11px] font-mono font-black text-white shadow-md backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-emerald-400" />
            <span>
              {latitude !== null && longitude !== null
                ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`
                : "ยังไม่ได้ปักหมุด"}
            </span>
          </span>
        </div>

        {/* Instructions Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
            💡 คลิกบนแผนที่หรือลากหมุดเพื่อเปลี่ยนพิกัด
          </span>
        </div>
      </div>
    </div>
  );
}
