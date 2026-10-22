"use client";

import React from "react";
import type { TravelMode, TripStop } from "@/types/trip";
import type { useLanguage } from "@/components/LanguageProvider";
import {
  InspectorHeader,
  InspectorImage,
  InspectorDetails,
  InspectorActions,
} from "./inspector";

interface TripStopInspectorProps {
  selectedStop: TripStop;
  orderedStops: TripStop[];
  travelMode: TravelMode;
  failedStopImages: Record<string, boolean>;
  onImageError: (stopId: string) => void;
  onSelectStop: (stopId: string) => void;
  t: ReturnType<typeof useLanguage>["t"];
}

export function TripStopInspector({
  selectedStop,
  orderedStops,
  travelMode,
  failedStopImages,
  onImageError,
  onSelectStop,
  t,
}: TripStopInspectorProps) {
  return (
    <div
      aria-labelledby="selected-stop-heading"
      aria-live="polite"
      className="cute-card animate-fade-up overflow-hidden border-[var(--color-brand-primary)]"
    >
      {/* Inspector Header with Stop sequence & prev/next buttons */}
      <InspectorHeader
        selectedStop={selectedStop}
        orderedStops={orderedStops}
        onSelectStop={onSelectStop}
        t={t}
      />

      <div className="space-y-5 p-5">
        {/* Full-width 3:4 Carousel specifically for this selected stop's photo set */}
        <InspectorImage
          selectedStop={selectedStop}
          orderedStops={orderedStops}
          failedStopImages={failedStopImages}
          onImageError={onImageError}
          t={t}
        />

        {/* Bottom Details Row: Description, Stats Grid & Notes */}
        <InspectorDetails selectedStop={selectedStop} t={t} />

        {/* Action Button: Navigate in Google Maps */}
        <InspectorActions
          selectedStop={selectedStop}
          travelMode={travelMode}
          t={t}
        />
      </div>
    </div>
  );
}
