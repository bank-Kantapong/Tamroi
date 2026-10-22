"use client";

import React from "react";
import { Info, Wallet } from "lucide-react";
import type { TripStop } from "@/types/trip";
import type { useLanguage } from "@/components/LanguageProvider";

interface InspectorDetailsProps {
  selectedStop: TripStop;
  t: ReturnType<typeof useLanguage>["t"];
}

export function InspectorDetails({ selectedStop, t }: InspectorDetailsProps) {
  return (
    <div>
      <p className="text-sm font-medium leading-relaxed text-[var(--color-brand-deep)]">
        {selectedStop.description}
      </p>

      {/* Estimated Cost Pill (If specified) */}
      {selectedStop.estimated_cost !== null && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--color-sun-yellow)]/60 bg-[var(--color-sun-cream)] px-4 py-2 text-xs shadow-sm">
          <Wallet className="h-4 w-4 text-[var(--color-amber-text)]" aria-hidden="true" />
          <span className="font-bold text-[var(--color-amber-text)]">
            {t.detail.estimatedCost}:
          </span>
          <span className="font-heading font-black text-[var(--color-brand-deep)]">
            {selectedStop.estimated_cost === 0
              ? t.detail.freeCost
              : `฿${selectedStop.estimated_cost.toLocaleString()}`}
          </span>
        </div>
      )}

      {selectedStop.notes && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl border-2 border-[var(--color-sun-yellow)] bg-[var(--color-sun-cream)] p-3 text-xs font-medium text-[var(--color-sun-text)]">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sun-amber)]"
            aria-hidden="true"
          />
          <span>{selectedStop.notes}</span>
        </div>
      )}
    </div>
  );
}
