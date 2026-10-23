import React from "react";

export function TripCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading trip card"
      className="cute-card overflow-hidden p-2.5 border-[var(--color-border-subtle)]"
    >
      {/* 4:3 Aspect Ratio Photo Skeleton */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-200 animate-pulse">
        {/* Top-left location badge skeleton */}
        <div className="absolute left-2.5 top-2.5 h-5 w-16 rounded-full bg-slate-300/80" />
        {/* Top-right bookmark button skeleton */}
        <div className="absolute right-2.5 top-2.5 h-6 w-6 rounded-full bg-slate-300/80" />
      </div>

      {/* Title skeleton */}
      <div className="mt-3 h-4 w-4/5 rounded-full bg-slate-200 animate-pulse" />

      {/* Description lines skeleton */}
      <div className="mt-2 space-y-1">
        <div className="h-3 w-full rounded-full bg-slate-200/80 animate-pulse" />
        <div className="h-3 w-2/3 rounded-full bg-slate-200/80 animate-pulse" />
      </div>

      {/* Meta tags pills skeleton */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <div className="h-5 w-14 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-slate-200 animate-pulse" />
      </div>

      {/* View Itinerary CTA button skeleton */}
      <div className="mt-3 h-8 w-full rounded-xl bg-slate-200 animate-pulse" />
    </div>
  );
}

export function TripCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <TripCardSkeleton key={idx} />
      ))}
    </div>
  );
}

