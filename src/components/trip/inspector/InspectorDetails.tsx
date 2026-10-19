"use client";

import React from "react";
import { Info } from "lucide-react";
import type { TripStop } from "@/types/trip";
import { formatCoordinatePair } from "@/lib/google-maps";
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

      <dl className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
        <div className="rounded-2xl border-2 border-[var(--color-border-alt)] bg-[var(--color-bg-soft)] p-2.5">
          <dt className="font-bold text-[var(--color-brand-primary)]">
            {t.detail.suggestedArrival}
          </dt>
          <dd className="mt-0.5 font-heading font-black text-[var(--color-brand-deep)]">
            {selectedStop.suggested_arrival_time || t.detail.flexible}
          </dd>
        </div>
        <div className="rounded-2xl border-2 border-[var(--color-mint-border-alt)] bg-[var(--color-mint-bg-alt)] p-2.5">
          <dt className="font-bold text-[var(--color-mint-text-dark)]">
            {t.detail.suggestedDuration}
          </dt>
          <dd className="mt-0.5 font-heading font-black text-[var(--color-brand-deep)]">
            {selectedStop.estimated_minutes !== null
              ? t.detail.minutesUnit(selectedStop.estimated_minutes)
              : t.detail.flexible}
          </dd>
        </div>
        <div className="rounded-2xl border-2 border-[var(--color-sun-yellow)]/60 bg-[var(--color-sun-cream)] p-2.5">
          <dt className="font-bold text-[var(--color-amber-text)]">
            {t.detail.estimatedCost}
          </dt>
          <dd className="mt-0.5 font-heading font-black text-[var(--color-brand-deep)]">
            {selectedStop.estimated_cost !== null
              ? selectedStop.estimated_cost === 0
                ? t.detail.freeCost
                : `฿${selectedStop.estimated_cost.toLocaleString()}`
              : t.detail.notSpecified}
          </dd>
        </div>
        <div className="rounded-2xl border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] p-2.5">
          <dt className="font-bold text-[var(--color-coral-text-dark)]">
            {t.detail.coordinates}
          </dt>
          <dd className="mt-0.5 font-mono text-[11px] font-extrabold text-[var(--color-brand-deep)]">
            {formatCoordinatePair(
              selectedStop.latitude,
              selectedStop.longitude,
              5
            )}
          </dd>
        </div>
      </dl>

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

