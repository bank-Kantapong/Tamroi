"use client";

import React from "react";
import { Navigation } from "lucide-react";
import type { TravelMode, TripStop } from "@/types/trip";
import { buildStopNavigationUrl } from "@/lib/google-maps";
import type { useLanguage } from "@/components/LanguageProvider";

interface InspectorActionsProps {
  selectedStop: TripStop;
  travelMode: TravelMode;
  t: ReturnType<typeof useLanguage>["t"];
}

export function InspectorActions({
  selectedStop,
  travelMode,
  t,
}: InspectorActionsProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t-2 border-dashed border-[var(--color-border-subtle)] pt-3.5">
      <a
        href={buildStopNavigationUrl(selectedStop, travelMode)}
        target="_blank"
        rel="noopener noreferrer"
        className="cute-yellow-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold shadow-sm"
      >
        <Navigation className="h-4 w-4" aria-hidden="true" />
        <span>{t.detail.navigateStopBtn}</span>
      </a>
    </div>
  );
}
