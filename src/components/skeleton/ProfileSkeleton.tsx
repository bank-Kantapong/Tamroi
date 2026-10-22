import React from "react";

export function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading profile"
      className="cute-page-container py-8 sm:py-12"
    >
      <div className="mx-auto max-w-xl">
        <div className="mb-6 h-5 w-24 rounded-full bg-slate-200 animate-pulse" />

        <div className="cute-card space-y-6 p-6 sm:p-8 animate-pulse">
          {/* Avatar and header skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-6 w-36 rounded-full bg-slate-200" />
              <div className="h-4 w-48 rounded-full bg-slate-200" />
            </div>
          </div>

          {/* Form fields skeleton */}
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded-full bg-slate-200" />
              <div className="h-11 w-full rounded-2xl bg-slate-200" />
            </div>

            <div className="space-y-1.5">
              <div className="h-4 w-20 rounded-full bg-slate-200" />
              <div className="h-11 w-full rounded-2xl bg-slate-200" />
            </div>

            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded-full bg-slate-200" />
              <div className="h-24 w-full rounded-2xl bg-slate-200" />
            </div>

            {/* Submit button skeleton */}
            <div className="pt-2">
              <div className="h-11 w-full rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

