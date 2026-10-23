"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  Map,
  ListOrdered,
  Sparkles,
} from "lucide-react";
import type { TripStop, TripWithStops } from "@/types/trip";
import { buildTripGoogleMapsLinks } from "@/lib/google-maps";
import { calculateItineraryMetrics } from "@/lib/format-utils";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeTripWithStops } from "@/lib/i18n-trips";
import { useTripDetailStore } from "@/stores/useTripDetailStore";
import { TripScrapbookHeader } from "./TripScrapbookHeader";
import { TripStopInspector } from "./TripStopInspector";
import { TripStopListItem } from "./TripStopListItem";
import { SaveTripButton } from "./SaveTripButton";

const TripLeafletMap = dynamic(() => import("./TripLeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="cute-card flex h-[300px] w-full animate-pulse items-center justify-center bg-[var(--color-bg-soft)] text-sm font-extrabold text-[var(--color-brand-primary)]">
      กำลังโหลดแผนที่เส้นทาง (Loading interactive map)...
    </div>
  ),
});

interface TripDetailViewProps {
  trip: TripWithStops;
  isAdminPreview?: boolean;
}

const STOP_NUMBER_COLORS = [
  "bg-[var(--color-brand-cyan)]",
  "bg-[var(--color-sage-dark)]",
  "bg-[var(--color-sun-yellow)]",
  "bg-[var(--color-coral-accent)]",
];

export function TripDetailView({
  trip: initialTrip,
  isAdminPreview = false,
}: TripDetailViewProps) {
  const { locale, t } = useLanguage();
  const trip = localizeTripWithStops(initialTrip, locale);

  const orderedStops = [...trip.stops].sort((a, b) => a.sequence - b.sequence);

  // If this is a single-review trip with header coordinates, construct a single-place stop
  const singlePlaceStop: TripStop | null =
    orderedStops.length === 0 &&
    trip.latitude !== null &&
    trip.latitude !== undefined &&
    trip.longitude !== null &&
    trip.longitude !== undefined
      ? {
          id: `single-place-${trip.id}`,
          trip_id: trip.id,
          place_name: trip.location_name || trip.title,
          description: trip.short_description,
          latitude: trip.latitude,
          longitude: trip.longitude,
          sequence: 1,
          image_url: trip.cover_image_url ? trip.cover_image_url.split(/[\n,;]+/)[0].trim() : null,
          estimated_minutes: null,
          suggested_arrival_time: null,
          estimated_cost: null,
          notes: null,
          created_at: trip.created_at,
          updated_at: trip.updated_at,
        }
      : null;

  const displayStops = orderedStops.length > 0 ? orderedStops : singlePlaceStop ? [singlePlaceStop] : [];

  // Zustand Store for Trip Detail State
  const {
    selectedStopId,
    coverFailed,
    failedStopImages,
    selectStop,
    setCoverFailed,
    markStopImageFailed,
    resetState,
  } = useTripDetailStore();

  // Initialize/Reset store on trip mount
  const firstStopId = displayStops[0]?.id ?? null;
  useEffect(() => {
    resetState(firstStopId);
  }, [initialTrip.id, firstStopId, resetState]);

  const selectedStop =
    orderedStops.find((s) => s.id === selectedStopId) ?? orderedStops[0] ?? null;

  // Reusable utility for calculating total cost & duration
  const { totalCost: totalStopCost, totalMinutes: totalEstimatedMinutes } =
    calculateItineraryMetrics(orderedStops);

  const googleMapsResult = buildTripGoogleMapsLinks(
    displayStops,
    trip.travel_mode || "driving"
  );

  const modeLabel =
    trip.travel_mode === "driving"
      ? t.card.travelMode.driving
      : trip.travel_mode === "walking"
        ? t.card.travelMode.walking
        : trip.travel_mode === "transit"
          ? t.card.travelMode.transit
          : trip.travel_mode === "bicycling"
            ? t.card.travelMode.bicycling
            : trip.travel_mode === "other"
              ? trip.travel_mode_note || "อื่นๆ (Other)"
              : "";

  const totalPhotos =
    (trip.cover_image_url ? 1 : 0) +
    orderedStops.filter((s) => Boolean(s.image_url)).length;

  return (
    <div className="cute-page-container pb-16 pt-6 sm:pt-8">
      {/* Top Navigation Row: Back Link & Admin Preview Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-4 py-2 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)]"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--color-brand-primary)]" aria-hidden="true" />
          <span>{t.detail.backHome}</span>
        </Link>

        <div className="flex items-center gap-2">
          <SaveTripButton tripId={trip.id} variant="detail" />

          {isAdminPreview && (
            <div
              role="status"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] px-4 py-1.5 text-xs font-black text-[var(--color-coral-text-dark)] shadow-sm"
            >
              <ShieldAlert className="h-4 w-4 text-[var(--color-coral-accent)]" aria-hidden="true" />
              <span>{t.detail.adminPreviewBadge} {trip.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* Trip Header Scrapbook Card Subcomponent */}
      <TripScrapbookHeader
        trip={trip}
        orderedStops={displayStops}
        totalPhotos={totalPhotos}
        totalStopCost={totalStopCost}
        totalEstimatedMinutes={totalEstimatedMinutes}
        googleMapsResult={googleMapsResult}
        modeLabel={modeLabel}
        coverFailed={coverFailed}
        onCoverError={() => setCoverFailed(true)}
        locale={locale}
        t={t}
      />

      {/* Mobile Quick Jump Pills (Map vs Stop List) - only if multi-stop */}
      {orderedStops.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2.5 lg:hidden">
          <a
            href="#map-section-heading"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-3.5 py-2.5 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-sm"
          >
            <Map className="h-4 w-4 text-[var(--color-brand-primary)]" aria-hidden="true" />
            {t.detail.listJumpToMap}
          </a>
          <a
            href="#itinerary-list-heading"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-3.5 py-2.5 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-sm"
          >
            <ListOrdered className="h-4 w-4 text-[var(--color-brand-primary)]" aria-hidden="true" />
            {t.detail.mapJumpToList} ({orderedStops.length})
          </a>
        </div>
      )}

      {/* Map & Ordered Stops Section (rendered if multi-stop OR if single-review place is pinned) */}
      {displayStops.length > 0 && (
        <div className="mt-6 space-y-8 lg:mt-8">
          {/* Row 1: Interactive Map (Full Width 1 Row) */}
          <section aria-labelledby="map-section-heading" className="w-full">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="map-section-heading"
                className="font-heading text-lg font-black text-[var(--color-brand-deep)]"
              >
                {orderedStops.length > 0
                  ? t.detail.mapHeading
                  : locale === "th"
                    ? "พิกัดสถานที่บนแผนที่"
                    : "Location on Map"}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-border-alt)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand-primary)]">
                <Sparkles className="h-3 w-3 text-[var(--color-brand-cyan)]" aria-hidden="true" />
                {orderedStops.length > 0
                  ? t.detail.mapSubheading(orderedStops.length)
                  : (trip.location_name || trip.title)}
              </span>
            </div>
            <TripLeafletMap
              stops={displayStops}
              selectedStopId={selectedStop?.id ?? displayStops[0]?.id ?? null}
              onSelectStop={(id) => selectStop(id, true)}
            />
          </section>

          {/* Row 2: Selected Stop Inspector (Left) + Ordered Stop List (Right) - only if multi-stop */}
          {orderedStops.length > 0 && (
            <div className="grid grid-cols-1 items-start gap-6 border-t-2 border-dashed border-[var(--color-border-subtle)] pt-7 sm:gap-8 lg:grid-cols-12 lg:pt-8">
              {/* Left: Selected Stop Inspector */}
              <div className="lg:col-span-7">
                {selectedStop && (
                  <TripStopInspector
                    selectedStop={selectedStop}
                    orderedStops={orderedStops}
                    travelMode={trip.travel_mode}
                    failedStopImages={failedStopImages}
                    onImageError={markStopImageFailed}
                    onSelectStop={(id) => selectStop(id, true)}
                    t={t}
                  />
                )}
              </div>

              {/* Right: Ordered Itinerary Stop List */}
              <section
                aria-labelledby="itinerary-list-heading"
                className="lg:col-span-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2
                    id="itinerary-list-heading"
                    className="font-heading text-lg font-black text-[var(--color-brand-deep)]"
                  >
                    {t.detail.itineraryHeading}
                  </h2>
                  <span className="rounded-full bg-[var(--color-bg-card-photo)] px-3 py-0.5 text-xs font-bold text-[var(--color-brand-primary)]">
                    {t.detail.itineraryHint}
                  </span>
                </div>

                <ol className="space-y-3.5" aria-label={t.detail.itineraryHeading}>
                  {orderedStops.map((stop, idx) => (
                    <TripStopListItem
                      key={stop.id}
                      stop={stop}
                      index={idx}
                      isSelected={selectedStop?.id === stop.id}
                      badgeColorClass={
                        STOP_NUMBER_COLORS[idx % STOP_NUMBER_COLORS.length]
                      }
                      travelMode={trip.travel_mode}
                      onSelectStop={selectStop}
                      t={t}
                    />
                  ))}
                </ol>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
