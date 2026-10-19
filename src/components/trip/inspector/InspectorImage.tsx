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

function getStopImages(stop: TripStop): CarouselSlideItem[] {
  if (stop.image_url) {
    const splitUrls = stop.image_url
      .split(/[\n,;]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (splitUrls.length >= 2) {
      return splitUrls.slice(0, 2).map((url, idx) => ({
        id: `${stop.id}-${idx}`,
        url,
        title: stop.place_name,
        subtitle: `มุมมองที่ ${idx + 1}`,
      }));
    }

    if (splitUrls.length === 1) {
      const first = splitUrls[0];
      const second =
        first.includes("bangkok")
          ? "/images/samples/bangkok-riverside.svg"
          : first.includes("chiangmai")
            ? "/images/samples/chiangmai-oldcity.svg"
            : first.includes("phuket")
              ? "/images/samples/phuket-coastal.svg"
              : "/images/tamroi_banner.png";

      return [
        {
          id: `${stop.id}-1`,
          url: first,
          title: stop.place_name,
          subtitle: "มุมมองหลัก (Main View)",
        },
        {
          id: `${stop.id}-2`,
          url: second,
          title: stop.place_name,
          subtitle: "มุมมองรอบจุดแวะ (Surroundings)",
        },
      ];
    }
  }

  // Fallback 2 mock photos
  return [
    {
      id: `${stop.id}-1`,
      url: "/images/samples/bangkok-riverside.svg",
      title: stop.place_name,
      subtitle: "มุมมองหลัก (Main View)",
    },
    {
      id: `${stop.id}-2`,
      url: "/images/samples/chiangmai-oldcity.svg",
      title: stop.place_name,
      subtitle: "มุมมองรอบจุดแวะ (Surroundings)",
    },
  ];
}

export function InspectorImage({
  selectedStop,
  orderedStops,
  t,
}: InspectorCarouselImageProps) {
  const slides = getStopImages(selectedStop);

  return (
    <ImageCarousel
      key={selectedStop.id}
      slides={slides}
      aspectRatioClass="aspect-[3/4]"
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
  );
}
