"use client";

import React from "react";
import type { TripStop, TripWithStops } from "@/types/trip";
import type { TripGoogleMapsResult } from "@/lib/google-maps";
import type { useLanguage } from "@/components/LanguageProvider";
import { PaperPlaneDoodle } from "@/components/illustrations";
import {
  TripHeaderPhotoFrame,
  TripHeaderMeta,
  TripHeaderStats,
  TripHeaderMapAction,
} from "./header";

interface TripScrapbookHeaderProps {
  trip: TripWithStops;
  orderedStops: TripStop[];
  totalPhotos: number;
  totalStopCost: number;
  totalEstimatedMinutes: number;
  googleMapsResult: TripGoogleMapsResult;
  modeLabel: string;
  coverFailed: boolean;
  onCoverError: () => void;
  locale: "th" | "en";
  t: ReturnType<typeof useLanguage>["t"];
}

export function TripScrapbookHeader({
  trip,
  orderedStops,
  totalPhotos,
  totalStopCost,
  totalEstimatedMinutes,
  googleMapsResult,
  modeLabel,
  coverFailed,
  onCoverError,
  locale,
  t,
}: TripScrapbookHeaderProps) {
  return (
    <div className="animate-fade-up relative scrapbook-header-card">
      {/* Top-right Paper Plane + Looping Dashed Trail SVG */}
      <PaperPlaneDoodle className="pointer-events-none absolute -top-3 right-3 hidden h-20 w-40 select-none sm:block" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* Left Column: Cover Photo Frame Subcomponent with Interactive Carousel */}
        <TripHeaderPhotoFrame
          trip={trip}
          orderedStops={orderedStops}
          totalPhotos={totalPhotos}
          coverFailed={coverFailed}
          onCoverError={onCoverError}
          locale={locale}
          t={t}
        />

        {/* Right Column: Meta, Stats & Google Maps Action Subcomponents */}
        <div className="flex flex-col justify-between p-1 sm:p-2 lg:p-3 lg:col-span-7">
          <TripHeaderMeta
            trip={trip}
            modeLabel={modeLabel}
            locale={locale}
          />

          <div className="mt-5">
            <TripHeaderStats
              trip={trip}
              orderedStops={orderedStops}
              totalStopCost={totalStopCost}
              totalEstimatedMinutes={totalEstimatedMinutes}
              locale={locale}
              t={t}
            />

            <TripHeaderMapAction
              googleMapsResult={googleMapsResult}
              stopsCount={orderedStops.length}
              modeLabel={modeLabel}
              locale={locale}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
