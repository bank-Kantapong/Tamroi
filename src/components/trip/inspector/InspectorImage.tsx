"use client";

import React from "react";
import { MapPin } from "lucide-react";
import type { TripStop } from "@/types/trip";
import type { useLanguage } from "@/components/LanguageProvider";
import { ImageCarousel, CarouselSlideItem } from "@/components/common";

interface InspectorCarouselImageProps {
  selectedStop: TripStop;
  orderedStops: TripStop[];
  failedStopImages: Record<string, boolean>;
  onImageError: (stopId: string) => void;
  t: ReturnType<typeof useLanguage>["t"];
}

function parseImageUrlWithCredit(raw: string): { url: string; credit?: string } {
  const trimmed = raw.trim();
  // Support syntax: "https://example.com/photo.jpg | Photo by John Doe"
  if (trimmed.includes("|")) {
    const [u, ...c] = trimmed.split("|");
    return { url: u.trim(), credit: c.join("|").trim() || undefined };
  }
  return { url: trimmed };
}

function extractCreditFromNotes(notes: string | null): string | undefined {
  if (!notes) return undefined;
  // Match patterns like "Photo: Name", "Credit: Name", "Photo by Name", "ภาพ: ชื่อ"
  const match = notes.match(/(?:photo\s*(?:by|credit)?|credit|ภาพ\s*(?:โดย)?|เครดิต)\s*[:：\-]\s*([^,\n;]+)/i);
  return match ? match[1].trim() : undefined;
}

function getStopImages(stop: TripStop): CarouselSlideItem[] {
  const notesCredit = extractCreditFromNotes(stop.notes);

  if (stop.image_url) {
    const splitUrls = stop.image_url
      .split(/[\n,;]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (splitUrls.length > 0) {
      return splitUrls.map((entry, idx) => {
        const parsed = parseImageUrlWithCredit(entry);
        return {
          id: `${stop.id}-${idx}`,
          url: parsed.url,
          title: stop.place_name,
          subtitle: splitUrls.length > 1 ? `มุมมองที่ ${idx + 1}` : undefined,
          credit: parsed.credit || notesCredit,
        };
      });
    }
  }

  return [];
}

export function InspectorImage({
  selectedStop,
  orderedStops,
  t,
}: InspectorCarouselImageProps) {
  const slides = getStopImages(selectedStop);

  return (
    <div className="w-full max-w-md mx-auto">
      <ImageCarousel
        key={selectedStop.id}
        slides={slides}
        aspectRatioClass="aspect-[3/4] w-full"
        showFullscreenButton={true}
        emptyPlaceholderText={t.detail.noStopPhoto}
        overlayChildren={
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-[var(--color-brand-deep)]/80 px-3.5 py-1 text-xs font-black text-white shadow-md backdrop-blur-md">
              <MapPin className="h-3 w-3 text-[var(--color-accent-aqua)]" aria-hidden="true" />
              <span>
                {t.detail.selectedStopBadge(selectedStop.sequence, orderedStops.length)}
              </span>
            </span>
          </div>
        }
      />
    </div>
  );
}
