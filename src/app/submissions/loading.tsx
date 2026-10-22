import { SubmissionListSkeleton } from "@/components/skeleton";

export default function SubmissionsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading submissions"
      className="cute-page-container py-8 sm:py-12 space-y-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-8 w-56 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-4 w-72 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-2xl bg-slate-200 animate-pulse" />
      </div>

      <SubmissionListSkeleton count={4} />
    </div>
  );
}

