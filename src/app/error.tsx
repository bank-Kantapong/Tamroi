"use client";

import { AlertOctagon, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="cute-card border-[var(--color-coral-border-alt)] p-8">
        <div className="mx-auto flex h-16 w-16 -rotate-6 items-center justify-center rounded-3xl border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] text-[var(--color-coral-text-dark)] shadow-sm">
          <AlertOctagon className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-heading text-xl font-black text-[var(--color-brand-deep)]">
          เกิดข้อผิดพลาดขณะโหลดหน้านี้ (Something went wrong)
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="cute-yellow-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            ลองใหม่อีกครั้ง (Try Again)
          </button>
        </div>
      </div>
    </div>
  );
}
