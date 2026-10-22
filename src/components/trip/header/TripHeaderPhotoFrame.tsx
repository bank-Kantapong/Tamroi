"use client";

import React, { useState } from "react";
import { MapPin, Maximize2 } from "lucide-react";
import type { TripStop, TripWithStops } from "@/types/trip";
import type { useLanguage } from "@/components/LanguageProvider";
import { ImageCarousel, CarouselSlideItem, ImageLightboxModal, ModalImageItem } from "@/components/common";

interface TripHeaderPhotoFrameProps {
  trip: TripWithStops;
  orderedStops: TripStop[];
  totalPhotos: number;
  coverFailed: boolean;
  onCoverError: () => void;
  locale: "th" | "en";
  t: ReturnType<typeof useLanguage>["t"];
}

function parseImageUrlWithCredit(raw: string): { url: string; credit?: string } {
  const trimmed = raw.trim();
  if (trimmed.includes("|")) {
    const [u, ...c] = trimmed.split("|");
    return { url: u.trim(), credit: c.join("|").trim() || undefined };
  }
  return { url: trimmed };
}

function extractCreditFromNotes(notes: string | null): string | undefined {
  if (!notes) return undefined;
  const match = notes.match(/(?:photo\s*(?:by|credit)?|credit|ภาพ\s*(?:โดย)?|เครดิต)\s*[:：\-]\s*([^,\n;]+)/i);
  return match ? match[1].trim() : undefined;
}

export function TripHeaderPhotoFrame({
  trip,
  orderedStops,
  coverFailed,
  locale,
  t,
}: TripHeaderPhotoFrameProps) {
  // Build slide items from trip cover and stops with images
  const slides: CarouselSlideItem[] = [];

  if (trip.cover_image_url && !coverFailed) {
    const rawCovers = trip.cover_image_url
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    rawCovers.forEach((rawCover, idx) => {
      const parsedCover = parseImageUrlWithCredit(rawCover);
      slides.push({
        id: idx === 0 ? "cover" : `cover-${idx}`,
        url: parsedCover.url,
        title: trip.title,
        subtitle: trip.province,
        badge: trip.province,
        credit: parsedCover.credit,
      });
    });
  }

  orderedStops.forEach((stop) => {
    if (stop.image_url) {
      const parsed = parseImageUrlWithCredit(stop.image_url);
      const notesCredit = extractCreditFromNotes(stop.notes);
      slides.push({
        id: stop.id,
        url: parsed.url,
        title: stop.place_name,
        subtitle: `${locale === "th" ? `จุดที่ ${stop.sequence}` : `Stop #${stop.sequence}`}: ${stop.place_name}`,
        badge: `${locale === "th" ? `จุดที่ ${stop.sequence}` : `Stop #${stop.sequence}`}`,
        credit: parsed.credit || notesCredit,
      });
    }
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const activeSlide = slides[activeIdx % slides.length];
  const isCover = activeSlide?.id === "cover";

  const modalImages: ModalImageItem[] = slides.map((s) => ({
    url: s.url,
    title: s.title,
    subtitle: s.subtitle,
  }));

  return (
    <>
      <div className="relative lg:col-span-5 w-full">
        <ImageCarousel
          slides={slides}
          aspectRatioClass="aspect-[3/4] w-full"
          className="w-full border-none shadow-none rounded-none"
          showFullscreenButton={false}
          emptyPlaceholderText={t.card.noCover}
          initialIndex={0}
          onIndexChange={setActiveIdx}
          overlayChildren={
            <>
              {/* Top-right Fullscreen Button */}
              {slides.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsFullscreenOpen(true)}
                  aria-label="View full screen"
                  className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-white hover:bg-black/70 active:scale-95"
                >
                  <Maximize2 className="h-4 w-4 drop-shadow-sm" />
                </button>
              )}

              {/* Top-left Location Pill */}
              <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-[var(--color-brand-teal-dark)]/85 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md backdrop-blur-md">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[var(--color-brand-teal-dark)]">
                  <MapPin className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                </span>
                <span>
                  {isCover
                    ? trip.province
                    : activeSlide?.subtitle || trip.province}
                </span>
              </span>
            </>
          }
        />
      </div>

      {/* Fullscreen Lightbox Modal for Cover Carousel */}
      <ImageLightboxModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        images={modalImages}
        initialIndex={activeIdx}
      />
    </>
  );
}
