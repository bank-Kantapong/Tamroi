"use client";

import React from "react";
import { Star, Utensils, Car, Footprints, Train, Bike, Compass } from "lucide-react";
import type { TripWithStops } from "@/types/trip";
import { ScrapbookCurveCyan, RisingSunDoodle } from "@/components/illustrations";

interface TripHeaderMetaProps {
  trip: TripWithStops;
  modeLabel: string;
  locale: "th" | "en";
}

const TRAVEL_MODE_ICONS = {
  driving: Car,
  walking: Footprints,
  transit: Train,
  bicycling: Bike,
  other: Compass,
};

export function TripHeaderMeta({ trip, modeLabel, locale }: TripHeaderMetaProps) {
  const ModeIcon = trip.travel_mode
    ? (TRAVEL_MODE_ICONS[trip.travel_mode as keyof typeof TRAVEL_MODE_ICONS] ?? Compass)
    : Car;

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-tag-bg)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand-tag)]">
          <Star className="h-3.5 w-3.5 text-[var(--color-brand-tag)]" aria-hidden="true" />
          <span>{locale === "th" ? "เที่ยวไหนดี" : "Featured"}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-tag-bg)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand-tag)]">
          <Utensils className="h-3.5 w-3.5 text-[var(--color-brand-tag)]" aria-hidden="true" />
          <span>{trip.category}</span>
        </span>
        {modeLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mint-bg)] px-3 py-1 text-xs font-extrabold text-[var(--color-mint-text-dark)]">
            <ModeIcon className="h-3.5 w-3.5 text-[var(--color-mint-text-dark)]" aria-hidden="true" />
            <span>{modeLabel}</span>
          </span>
        )}
      </div>

      {/* Floating Tilted Handwritten Note on the Right */}
      <div className="pointer-events-none float-right ml-3 mt-2 hidden -rotate-12 select-none text-center text-[var(--color-brand-teal-light)] xl:block">
        <span className="block font-heading text-sm font-black leading-tight">
          {locale === "th" ? "เก็บครบ" : "Explore"}
        </span>
        <span className="block font-heading text-sm font-black leading-tight">
          {locale === "th" ? "ทุกมุมสวย" : "Every Spot"}
        </span>
        <span className="block font-heading text-sm font-black leading-tight">
          {locale === "th" ? `ของ${trip.province} ♡` : `in ${trip.province} ♡`}
        </span>
        <ScrapbookCurveCyan className="mx-auto mt-0.5 h-2.5 w-20" />
      </div>

      <h1 className="mt-3.5 font-heading text-2xl font-black leading-snug tracking-tight text-[var(--color-brand-deep)] sm:text-[28px]">
        {trip.title}
      </h1>

      <p className="mt-2.5 text-sm font-extrabold leading-relaxed text-[var(--color-brand-tag)] sm:text-[15px]">
        {trip.short_description}
      </p>

      <div className="mt-3 text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
        <p className="whitespace-pre-line">{trip.description}</p>
        {locale === "th" && (
          <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 font-semibold text-slate-600">
            <span>
              เดินทางง่าย ใช้เวลาไม่มาก ใครมีวันหยุดสั้นๆ ก็เที่ยวตามได้เลย ♡
            </span>
            <RisingSunDoodle className="inline-block h-5 w-6 text-[var(--color-brand-teal-light)]" />
          </p>
        )}
      </div>
    </div>
  );
}

