import React from "react";

export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-label="Loading admin dashboard"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-60 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-4 w-40 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-2xl bg-slate-200 animate-pulse" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="cute-card flex items-center justify-between p-4 animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-5 w-48 rounded-full bg-slate-200" />
              <div className="h-3.5 w-32 rounded-full bg-slate-200" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded-full bg-slate-200" />
              <div className="h-8 w-16 rounded-full bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

