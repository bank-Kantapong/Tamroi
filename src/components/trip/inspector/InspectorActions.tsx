"use client";

import React from "react";
import { Navigation, Check, Copy } from "lucide-react";
import type { TravelMode, TripStop } from "@/types/trip";
import { formatCoordinatePair, buildStopNavigationUrl } from "@/lib/google-maps";
import type { useLanguage } from "@/components/LanguageProvider";

interface InspectorActionsProps {
  selectedStop: TripStop;
  travelMode: TravelMode;
  onCopyCoordinates: (stop: TripStop) => void;
  copiedStopId: string | null;
  copyErrorStopId: string | null;
  t: ReturnType<typeof useLanguage>["t"];
}

export function InspectorActions({
  selectedStop,
  travelMode,
  onCopyCoordinates,
  copiedStopId,
  copyErrorStopId,
  t,
}: InspectorActionsProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t-2 border-dashed border-[var(--color-border-subtle)] pt-3.5">
      <a
        href={buildStopNavigationUrl(selectedStop, travelMode)}
        target="_blank"
        rel="noopener noreferrer"
        className="cute-yellow-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold"
      >
        <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{t.detail.navigateStopBtn}</span>
      </a>

      <button
        type="button"
        onClick={() => onCopyCoordinates(selectedStop)}
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-4 py-2 text-xs font-extrabold text-[var(--color-brand-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)]"
      >
        {copiedStopId === selectedStop.id ? (
          <>
            <Check
              className="h-3.5 w-3.5 text-[var(--color-brand-primary)]"
              aria-hidden="true"
            />
            <span className="font-extrabold text-[var(--color-brand-primary)]">
              {t.detail.copiedCoordsBtn(
                formatCoordinatePair(
                  selectedStop.latitude,
                  selectedStop.longitude,
                  4
                )
              )}
            </span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
            <span>{t.detail.copyCoordsBtn}</span>
          </>
        )}
      </button>

      {copyErrorStopId === selectedStop.id && (
        <span role="alert" className="text-xs font-bold text-red-600">
          {t.detail.copyErrorMsg}{" "}
          {formatCoordinatePair(selectedStop.latitude, selectedStop.longitude, 6)}
        </span>
      )}
    </div>
  );
}

