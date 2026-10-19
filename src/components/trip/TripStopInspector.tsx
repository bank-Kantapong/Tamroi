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
  onCopyCoordinates: (stop: TripStop) => void;
  copiedStopId: string | null;
  copyErrorStopId: string | null;
  t: ReturnType<typeof useLanguage>["t"];
}

export function TripStopInspector({
  selectedStop,
  orderedStops,
  travelMode,
  failedStopImages,
  onImageError,
  onSelectStop,
  onCopyCoordinates,
  copiedStopId,
  copyErrorStopId,
  t,
}: TripStopInspectorProps) {
  return (
    <div
      aria-labelledby="selected-stop-heading"
      aria-live="polite"
      className="cute-card animate-fade-up overflow-hidden border-[var(--color-brand-primary)]"
    >
      <InspectorHeader
        selectedStop={selectedStop}
        orderedStops={orderedStops}
        onSelectStop={onSelectStop}
        t={t}
      />

      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-12">
        <InspectorImage
          selectedStop={selectedStop}
          hasFailed={Boolean(failedStopImages[selectedStop.id])}
          onImageError={onImageError}
          t={t}
        />

        <div className="flex flex-col justify-between sm:col-span-7">
          <InspectorDetails selectedStop={selectedStop} t={t} />

          <InspectorActions
            selectedStop={selectedStop}
            travelMode={travelMode}
            onCopyCoordinates={onCopyCoordinates}
            copiedStopId={copiedStopId}
            copyErrorStopId={copyErrorStopId}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
