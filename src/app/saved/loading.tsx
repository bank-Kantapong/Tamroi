import { TripCardSkeletonGrid } from "@/components/skeleton";

export default function SavedLoading() {
  return (
    <div
      role="status"
      aria-label="Loading saved trips"
      className="cute-page-container py-8 sm:py-12 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-8 w-48 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-full bg-slate-200 animate-pulse" />
      </div>

      <TripCardSkeletonGrid count={3} />
    </div>
  );
}

