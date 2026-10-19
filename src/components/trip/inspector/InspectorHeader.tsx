"use client";

import React from "react";
import type { TripStop } from "@/types/trip";
import type { useLanguage } from "@/components/LanguageProvider";

interface InspectorHeaderProps {
  selectedStop: TripStop;
  orderedStops: TripStop[];
  onSelectStop: (stopId: string) => void;
  t: ReturnType<typeof useLanguage>["t"];
}

export function InspectorHeader({
  selectedStop,
  orderedStops,
  onSelectStop,
  t,
}: InspectorHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[var(--color-brand-primary)] via-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] px-5 py-3.5 text-white">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[var(--color-sun-yellow)] font-heading text-sm font-black text-[var(--color-sun-text)] shadow-md">
          {selectedStop.sequence}
        </span>
        <div>
          <span className="text-[11px] font-extrabold text-[var(--color-sun-yellow-light)]">
            {t.detail.selectedStopBadge(selectedStop.sequence, orderedStops.length)}
          </span>
          <h3
            id="selected-stop-heading"
            className="font-heading text-base font-extrabold sm:text-lg"
          >
            {selectedStop.place_name}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={selectedStop.sequence <= 1}
          onClick={() => {
            const prev = orderedStops.find(
              (s) => s.sequence === selectedStop.sequence - 1
            );
            if (prev) onSelectStop(prev.id);
          }}
          className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-white/30 disabled:opacity-40"
        >
          &larr; {t.detail.prevStop}
        </button>
        <button
          type="button"
          disabled={selectedStop.sequence >= orderedStops.length}
          onClick={() => {
            const next = orderedStops.find(
              (s) => s.sequence === selectedStop.sequence + 1
            );
            if (next) onSelectStop(next.id);
          }}
          className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-white/30 disabled:opacity-40"
        >
          {t.detail.nextStop} &rarr;
        </button>
      </div>
    </div>
  );
}

