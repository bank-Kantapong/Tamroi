"use client";

import React, { useState } from "react";
import {
  MapPin,
  Camera,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { TripStop, TripWithStops } from "@/types/trip";
import type { useLanguage } from "@/components/LanguageProvider";
import {
  ScrapbookPhotoUnderline,
  CurvedArrowPhoto,
} from "@/components/illustrations";

interface CarouselSlide {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  isCover: boolean;
  sequence?: number;
}

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
  totalPhotos,
  coverFailed,
  onCoverError,
  locale,
  t,
}: TripHeaderPhotoFrameProps) {
  // Build slide items from trip cover and stops with images
  const slides: CarouselSlide[] = [];

  if (trip.cover_image_url && !coverFailed) {
    slides.push({
      id: "cover",
      url: trip.cover_image_url,
      title: trip.title,
      subtitle: trip.province,
      isCover: true,
    });
  }

  orderedStops.forEach((stop) => {
    if (stop.image_url) {
      slides.push({
        id: stop.id,
        url: stop.image_url,
        title: stop.place_name,
        subtitle: `${locale === "th" ? `จุดที่ ${stop.sequence}` : `Stop #${stop.sequence}`}: ${stop.place_name}`,
        isCover: false,
        sequence: stop.sequence,
      });
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideFailures, setSlideFailures] = useState<Record<string, boolean>>({});

  const hasSlides = slides.length > 0;
  const activeSlide = hasSlides ? slides[currentIndex % slides.length] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasSlides) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasSlides) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleImageError = (slideId: string) => {
    setSlideFailures((prev) => ({ ...prev, [slideId]: true }));
    if (slideId === "cover") {
      onCoverError();
    }
  };

  const isSlideFailed = activeSlide ? Boolean(slideFailures[activeSlide.id]) : true;

  return (
    <div className="scrapbook-photo-frame group aspect-[4/3] min-h-[300px] select-none sm:aspect-[16/10] lg:col-span-5 lg:aspect-auto">
      {/* Background Image / Placeholder */}
      {activeSlide && !isSlideFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={activeSlide.id}
          src={activeSlide.url}
          alt={activeSlide.title}
          className="h-full w-full object-cover transition-opacity duration-300"
          onError={() => handleImageError(activeSlide.id)}
        />
      ) : (
        <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--color-bg-aqua-fade)] via-[var(--color-mint-bg-alt)] to-[var(--color-sun-lightest)] p-6 text-center text-[var(--color-brand-deep)]">
          <ImageIcon
            className="mb-2 h-10 w-10 text-[var(--color-brand-primary)]/60"
            aria-hidden="true"
          />
          <span className="text-xs font-bold">{t.card.noCover}</span>
        </div>
      )}

      {/* Subtle top/bottom vignette so badges, arrows and handwritten text stay legible */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />

      {/* Top-left Location / Slide Pill */}
      <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-[var(--color-brand-teal-dark)]/85 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md backdrop-blur-md">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[var(--color-brand-teal-dark)]">
          <MapPin className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
        </span>
        <span>
          {activeSlide?.isCover
            ? trip.province
            : activeSlide?.subtitle || trip.province}
        </span>
      </span>

      {/* Carousel Navigation Arrows (Visible always on mobile, subtle hover reveal on desktop) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-110 hover:border-white hover:bg-black/60 active:scale-95 sm:opacity-75 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5 drop-shadow-sm" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-110 hover:border-white hover:bg-black/60 active:scale-95 sm:opacity-75 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5 drop-shadow-sm" />
          </button>
        </>
      )}

      {/* Handwritten Scrapbook Overlay Text on Photo (Shown for cover slide or formatted for stop) */}
      <div className="pointer-events-none absolute inset-x-5 top-16 select-none transition-opacity duration-300">
        <div className="-rotate-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5">
            <span className="text-lg font-black text-[var(--color-sun-yellow-bright)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
              =
            </span>
            <span className="font-heading text-2xl font-black tracking-wide text-white drop-shadow-[0_3px_6px_rgba(7,59,64,0.65)] sm:text-3xl">
              {activeSlide?.isCover ? trip.province : activeSlide?.title}
            </span>
            <span className="text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
              =
            </span>
          </div>

          <div className="mt-0.5 pl-4 font-heading text-2xl font-black text-white drop-shadow-[0_3px_6px_rgba(7,59,64,0.65)] sm:text-3xl">
            {locale === "th"
              ? activeSlide?.isCover
                ? "สวยครบ"
                : `จุดที่ ${activeSlide?.sequence}`
              : activeSlide?.isCover
                ? "Highlights"
                : `Stop #${activeSlide?.sequence}`}
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

      {/* Bottom-left Photo Count Badge / Current Index indicator */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2.5 rounded-2xl border border-white/25 bg-[var(--color-brand-deep)]/80 px-3.5 py-2 text-white shadow-lg backdrop-blur-md">
        <Camera className="h-5 w-5 text-white/90" aria-hidden="true" />
        <div className="leading-tight">
          <span className="block text-[10px] font-bold text-white/85">
            {activeSlide?.isCover
              ? locale === "th"
                ? "รูปปกทริป"
                : "Cover Photo"
              : locale === "th"
                ? `รูปจุดแวะ #${activeSlide?.sequence}`
                : `Stop #${activeSlide?.sequence}`}
          </span>
          <span className="block text-xs font-black text-white">
            {slides.length > 0
              ? `${currentIndex + 1} / ${slides.length} ${locale === "th" ? "รูป" : "Photos"}`
              : `${totalPhotos} ${locale === "th" ? "รูป" : "Photos"}`}
          </span>
        </div>
      </div>

      {/* Bottom-center Interactive Pagination Dots */}
      {slides.length > 1 && (
        <div
          role="tablist"
          aria-label="Image gallery carousel dots"
          className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm"
        >
          {slides.map((s, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`Go to photo ${idx + 1}`}
                onClick={(e) => handleDotClick(idx, e)}
                className={`transition-all duration-200 ${
                  isSelected
                    ? "h-2.5 w-6 rounded-full bg-white shadow-md"
                    : "h-2 w-2 rounded-full bg-white/60 hover:bg-white/90"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
