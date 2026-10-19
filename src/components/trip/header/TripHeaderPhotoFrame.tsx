"use client";

import React, { useState } from "react";
import { MapPin, Maximize2 } from "lucide-react";
import type { TripStop, TripWithStops } from "@/types/trip";
import type { useLanguage } from "@/components/LanguageProvider";
import {
  ScrapbookPhotoUnderline,
  CurvedArrowPhoto,
} from "@/components/illustrations";
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
    slides.push({
      id: "cover",
      url: trip.cover_image_url,
      title: trip.title,
      subtitle: trip.province,
      badge: trip.province,
    });
  }

  orderedStops.forEach((stop) => {
    if (stop.image_url) {
      slides.push({
        id: stop.id,
        url: stop.image_url,
        title: stop.place_name,
        subtitle: `${locale === "th" ? `จุดที่ ${stop.sequence}` : `Stop #${stop.sequence}`}: ${stop.place_name}`,
        badge: `${locale === "th" ? `จุดที่ ${stop.sequence}` : `Stop #${stop.sequence}`}`,
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
      <div className="scrapbook-photo-frame relative lg:col-span-5">
        <ImageCarousel
          slides={slides}
          aspectRatioClass="aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto min-h-[300px] h-full"
          className="h-full border-none shadow-none rounded-none"
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

              {/* Handwritten Scrapbook Overlay Text on Photo */}
              <div className="pointer-events-none absolute inset-x-5 top-16 select-none transition-opacity duration-300">
                <div className="-rotate-6 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-lg font-black text-[var(--color-sun-yellow-bright)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
                      =
                    </span>
                    <span className="font-heading text-2xl font-black tracking-wide text-white drop-shadow-[0_3px_6px_rgba(7,59,64,0.65)] sm:text-3xl">
                      {isCover ? trip.province : activeSlide?.title}
                    </span>
                    <span className="text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
                      =
                    </span>
                  </div>

                  <div className="mt-0.5 pl-4 font-heading text-2xl font-black text-white drop-shadow-[0_3px_6px_rgba(7,59,64,0.65)] sm:text-3xl">
                    {locale === "th"
                      ? isCover
                        ? "สวยครบ"
                        : "บรรยากาศดี"
                      : isCover
                        ? "Highlights"
                        : "Scenic View"}
                    <span className="ml-1.5 text-lg text-[var(--color-sun-yellow-bright)]">✦</span>
                  </div>

                  <div className="mt-0.5 pl-8 font-heading text-xl font-black text-[var(--color-sun-yellow-light)] drop-shadow-[0_3px_6px_rgba(7,59,64,0.7)] sm:text-2xl">
                    {locale === "th"
                      ? `จบใน ${trip.duration_label.split("(")[0].trim()}`
                      : trip.duration_label}{" "}
                    <span className="text-white">♡</span>
                  </div>

                  <ScrapbookPhotoUnderline className="ml-8 mt-0.5 h-3 w-36" />
                </div>

                <div className="mt-1 flex flex-col items-end pr-2">
                  <span className="-rotate-6 font-heading text-xs font-black text-[var(--color-brand-deep)] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] sm:text-sm">
                    One day
                  </span>
                  <span className="-rotate-6 font-heading text-xs font-black text-[var(--color-brand-deep)] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] sm:text-sm">
                    Trip ♡
                  </span>
                  <CurvedArrowPhoto className="mr-1 mt-0.5 h-7 w-11 text-[var(--color-brand-deep)] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]" />
                </div>
              </div>
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
