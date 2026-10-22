import React from "react";

export function TripCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading trip card"
      className="cute-card overflow-hidden p-4 border-[var(--color-border-subtle)]"
    >
      {/* 1:1 Aspect Ratio Photo Skeleton */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-200 animate-pulse">
        {/* Top-left location badge skeleton */}
        <div className="absolute left-3 top-3 h-6 w-20 rounded-full bg-slate-300/80" />
        {/* Top-right bookmark button skeleton */}
        <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-slate-300/80" />
      </div>

      {/* Title skeleton */}
      <div className="mt-4 h-5 w-4/5 rounded-full bg-slate-200 animate-pulse" />

      {/* Description lines skeleton */}
      <div className="mt-2.5 space-y-1.5">
        <div className="h-3.5 w-full rounded-full bg-slate-200/80 animate-pulse" />
        <div className="h-3.5 w-2/3 rounded-full bg-slate-200/80 animate-pulse" />
      </div>

      {/* Meta tags pills skeleton */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-6 w-14 rounded-full bg-slate-200 animate-pulse" />
      </div>

      {/* View Itinerary CTA button skeleton */}
      <div className="mt-5 h-10 w-full rounded-2xl bg-slate-200 animate-pulse" />
    </div>
  );
}

export function TripCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <TripCardSkeleton key={idx} />
      ))}
    </div>
  );
}

