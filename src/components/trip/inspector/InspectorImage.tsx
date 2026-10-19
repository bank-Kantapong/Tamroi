"use client";

import React from "react";
import { ImageOff } from "lucide-react";
import type { TripStop } from "@/types/trip";
import type { useLanguage } from "@/components/LanguageProvider";

interface InspectorImageProps {
  selectedStop: TripStop;
  hasFailed: boolean;
  onImageError: (stopId: string) => void;
  t: ReturnType<typeof useLanguage>["t"];
}

export function InspectorImage({
  selectedStop,
  hasFailed,
  onImageError,
  t,
}: InspectorImageProps) {
  return (
    <div className="sm:col-span-5">
      {selectedStop.image_url && !hasFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={selectedStop.image_url}
          alt={selectedStop.place_name}
          className="aspect-[4/3] w-full rounded-2xl border-2 border-[var(--color-border-subtle)] object-cover shadow-sm"
          onError={() => onImageError(selectedStop.id)}
        />
      ) : (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border-2 border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--color-bg-aqua-fade)] via-[var(--color-mint-bg-alt)] to-[var(--color-sun-lightest)] p-4 text-center text-[var(--color-brand-deep)]">
          <ImageOff
            className="mb-1.5 h-7 w-7 text-[var(--color-brand-primary)]/60"
            aria-hidden="true"
          />
          <span className="text-xs font-bold">{t.detail.noStopPhoto}</span>
        </div>
      )}
    </div>
  );
}

