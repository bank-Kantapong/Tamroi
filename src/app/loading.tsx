import { TripCardSkeletonGrid } from "@/components/skeleton";

export default function Loading() {
  return (
    <div
      className="space-y-8 pb-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Hero Banner Skeleton */}
      <section className="relative overflow-hidden rounded-b-[3rem] border-b-4 border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--color-brand-deep)] via-[var(--color-brand-primary)] to-[var(--color-brand-primary)] pb-24 pt-10 text-white sm:pb-28 sm:pt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <div className="h-7 w-36 rounded-full bg-white/20 animate-pulse" />
              <div className="h-12 w-4/5 rounded-2xl bg-white/25 animate-pulse sm:h-14" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full rounded-full bg-white/15 animate-pulse" />
                <div className="h-4 w-3/4 rounded-full bg-white/15 animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="h-64 w-full rounded-3xl bg-white/10 animate-pulse sm:h-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="-mt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search & Filter Bar Skeleton */}
        <div className="h-28 w-full rounded-3xl border-2 border-[var(--color-border-subtle)] bg-white p-4 shadow-lg animate-pulse" />

        {/* Section title skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-8 w-64 rounded-full bg-slate-200 animate-pulse" />
          </div>
          <div className="h-8 w-28 rounded-full bg-slate-200 animate-pulse" />
        </div>

        {/* 6 Trip Cards Grid Skeleton */}
        <TripCardSkeletonGrid count={6} />
      </div>

      <span className="sr-only">กำลังโหลดข้อมูลทริป...</span>
    </div>
  );
}
