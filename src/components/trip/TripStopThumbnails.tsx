"use client";

import { MapPin } from "lucide-react";
import type { TripStop } from "@/types/trip";
import {
  DashedArrowRight,
  CuteCameraDoodle,
  ScrapbookCurveShort,
} from "@/components/illustrations";

interface TripStopThumbnailsProps {
  previewStops: TripStop[];
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
  locale: "th" | "en";
}

export function TripStopThumbnails({
  previewStops,
  selectedStopId,
  onSelectStop,
  locale,
}: TripStopThumbnailsProps) {
  if (previewStops.length === 0) return null;

  return (
    <div className="animate-fade-up relative mt-5 flex flex-col items-center justify-center gap-4 px-2 sm:px-6 lg:flex-row">
      <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:flex-nowrap">
        {previewStops.map((stop, idx) => {
          const tiltClass =
            idx === 0
              ? "sm:-rotate-1"
              : idx === 1
                ? "sm:rotate-1"
                : "sm:-rotate-1";

          return (
            <div
              key={stop.id}
              className="flex w-full items-center justify-center gap-2.5 sm:w-auto"
            >
              <button
                type="button"
                onClick={() => onSelectStop(stop.id)}
                className={`group scrapbook-stop-thumb-btn ${tiltClass} ${
                  selectedStopId === stop.id
                    ? "border-[var(--color-brand-teal-light)] ring-2 ring-[var(--color-brand-teal-light)]/25"
                    : "border-white hover:border-[var(--color-border-subtle)]"
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[var(--color-bg-card-photo)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stop.image_url!}
                    alt={stop.place_name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Stop Number Badge + Name + Time */}
                <div className="mt-2.5 flex items-center gap-2.5 px-1">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)] text-xs font-black text-white shadow-sm">
                    {stop.sequence}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-xs font-black text-[var(--color-brand-deep)] group-hover:text-[var(--color-brand-teal-light)] sm:text-sm">
                      {stop.place_name}
                    </p>
                    {(stop.suggested_arrival_time || stop.estimated_minutes) && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <MapPin
                          className="h-3 w-3 shrink-0 text-[var(--color-brand-cyan)]"
                          aria-hidden="true"
                        />
                        <span>
                          {stop.suggested_arrival_time ??
                            `${stop.estimated_minutes} ${locale === "th" ? "นาที" : "min"}`}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {/* Dashed Teal Arrow Between Cards */}
              {idx < previewStops.length - 1 && (
                <DashedArrowRight className="hidden h-4 w-8 shrink-0 text-[var(--color-brand-teal-light)] md:block" />
              )}
            </div>
          );
        })}
      </div>

      {/* Right-side Cute Camera Doodle & Handwritten Note ("1 วัน ก็เที่ยวได้ ครบเลย! ♡") */}
      <div className="relative hidden shrink-0 flex-col items-center pl-4 pr-2 lg:flex">
        {/* Cute Tilted Camera Illustration SVG */}
        <CuteCameraDoodle className="-mt-4 ml-12 h-11 w-14 rotate-12" />

        <div className="-rotate-6 text-center text-[var(--color-brand-teal-dark)]">
          <p className="font-heading text-base font-black leading-tight">
            {locale === "th" ? "1 วัน" : "All in"}
          </p>
          <p className="font-heading text-base font-black leading-tight">
            {locale === "th" ? "ก็เที่ยวได้" : "Just 1 Day"}
          </p>
          <p className="font-heading text-base font-black leading-tight">
            {locale === "th" ? "ครบเลย! ♡" : "Easy Trip! ♡"}
          </p>
          <ScrapbookCurveShort className="mx-auto mt-0.5 h-2.5 w-24" />
        </div>
      </div>
    </div>
  );
}

