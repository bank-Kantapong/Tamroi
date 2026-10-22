import React from "react";
import { MapPin } from "lucide-react";

export function TripDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading itinerary details"
      className="cute-page-container pb-16 pt-6 sm:pt-8"
    >
      {/* Top Navigation Row Skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-9 w-32 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-9 w-28 rounded-full bg-slate-200 animate-pulse" />
      </div>

      {/* Trip Header Scrapbook Card Skeleton */}
      <div className="cute-card overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: 3:4 Photo Frame Skeleton */}
          <div className="w-full lg:col-span-5">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-slate-200 animate-pulse">
              <div className="absolute left-4 top-4 h-7 w-24 rounded-full bg-slate-300/80" />
              <div className="absolute right-4 top-4 h-9 w-9 rounded-full bg-slate-300/80" />
            </div>
          </div>

          {/* Right Column: Title, Metadata, Description & Actions */}
          <div className="space-y-4 lg:col-span-7">
            {/* Province & Category Pill Skeletons */}
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
            </div>

            {/* Title Skeleton */}
            <div className="h-8 w-4/5 rounded-full bg-slate-200 animate-pulse sm:h-10" />

            {/* Description lines skeleton */}
            <div className="space-y-2 pt-1">
              <div className="h-4 w-full rounded-full bg-slate-200/90 animate-pulse" />
              <div className="h-4 w-11/12 rounded-full bg-slate-200/90 animate-pulse" />
              <div className="h-4 w-3/4 rounded-full bg-slate-200/90 animate-pulse" />
            </div>

            {/* Stats row: Duration, Budget, Stops pills */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <div className="h-8 w-24 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-8 w-28 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-8 w-20 rounded-2xl bg-slate-200 animate-pulse" />
            </div>

            {/* Google Maps Launch Itinerary Button Skeleton */}
            <div className="pt-3">
              <div className="h-12 w-full max-w-sm rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Interactive Map Skeleton */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-6 w-28 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <div className="flex h-[320px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-100/90 animate-pulse sm:h-[400px]">
          <MapPin className="h-10 w-10 text-slate-300 animate-bounce" aria-hidden="true" />
          <div className="mt-3 h-4 w-48 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Row 2: Selected Stop Inspector (Left) + Ordered Stop List (Right) */}
      <div className="mt-8 grid grid-cols-1 items-start gap-6 border-t-2 border-dashed border-slate-200 pt-8 sm:gap-8 lg:grid-cols-12">
        {/* Left: Inspector Skeleton */}
        <div className="lg:col-span-7">
          <div className="cute-card overflow-hidden">
            {/* Inspector header */}
            <div className="h-14 w-full bg-slate-200 animate-pulse" />
            <div className="space-y-5 p-5">
              {/* 3:4 Inspector Photo Skeleton */}
              <div className="mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-3xl bg-slate-200 animate-pulse" />
              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-slate-200" />
                <div className="h-4 w-4/5 rounded-full bg-slate-200" />
              </div>
              {/* Cost pill skeleton */}
              <div className="h-8 w-32 rounded-2xl bg-slate-200 animate-pulse" />
              {/* Action Button */}
              <div className="h-10 w-44 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right: Ordered Itinerary Stop List Skeleton */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div className="h-6 w-36 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-5 w-20 rounded-full bg-slate-200 animate-pulse" />
          </div>

          <div className="space-y-3.5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-3xl border-2 border-slate-200 bg-white p-4 animate-pulse"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200" />
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <div className="h-5 w-1/2 rounded-full bg-slate-200" />
                    <div className="h-3.5 w-full rounded-full bg-slate-200/80" />
                    <div className="h-4 w-20 rounded-full bg-slate-200" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-7 w-20 rounded-full bg-slate-200" />
                      <div className="h-7 w-24 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
