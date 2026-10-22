import React from "react";

export function SubmissionCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading submission"
      className="cute-card flex flex-col justify-between gap-4 p-5 animate-pulse sm:p-6 md:flex-row md:items-center"
    >
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 rounded-full bg-slate-200" />
          <div className="h-5 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="h-6 w-3/4 rounded-full bg-slate-200" />
        <div className="h-4 w-full rounded-full bg-slate-200/80" />
        <div className="flex gap-3">
          <div className="h-4 w-20 rounded-full bg-slate-200" />
          <div className="h-4 w-16 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-full bg-slate-200" />
        <div className="h-9 w-20 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export function SubmissionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <SubmissionCardSkeleton key={idx} />
      ))}
    </div>
  );
}

