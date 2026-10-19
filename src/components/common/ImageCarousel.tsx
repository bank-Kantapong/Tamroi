"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ImageOff,
  Camera,
} from "lucide-react";
import { ImageLightboxModal, ModalImageItem } from "./ImageLightboxModal";

export interface CarouselSlideItem {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

interface ImageCarouselProps {
  slides: CarouselSlideItem[];
  aspectRatioClass?: string; // e.g. "aspect-[3/4]" or "aspect-[4/3]"
  className?: string;
  badgePrefix?: string;
  showFullscreenButton?: boolean;
  emptyPlaceholderText?: string;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  overlayChildren?: React.ReactNode;
}

export function ImageCarousel({
  slides,
  aspectRatioClass = "aspect-[3/4]",
  className = "",
  badgePrefix = "",
  showFullscreenButton = true,
  emptyPlaceholderText = "ไม่มีรูปภาพ (No photo)",
  initialIndex = 0,
  onIndexChange,
  overlayChildren,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const hasSlides = slides.length > 0;
  const activeSlide = hasSlides ? slides[currentIndex % slides.length] : null;
  const isCurrentFailed = activeSlide ? Boolean(failedImages[activeSlide.id]) : true;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasSlides || slides.length <= 1) return;
    const nextIdx = (currentIndex - 1 + slides.length) % slides.length;
    setCurrentIndex(nextIdx);
    onIndexChange?.(nextIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasSlides || slides.length <= 1) return;
    const nextIdx = (currentIndex + 1) % slides.length;
    setCurrentIndex(nextIdx);
    onIndexChange?.(nextIdx);
  };

  const handleDotClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(idx);
    onIndexChange?.(idx);
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleOpenFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSlides && !isCurrentFailed) {
      setIsFullscreenOpen(true);
    }
  };

  const modalImages: ModalImageItem[] = slides.map((s) => ({
    url: s.url,
    title: s.title,
    subtitle: s.subtitle,
  }));

  return (
    <>
      <div
        className={`group relative w-full overflow-hidden rounded-3xl border-2 border-[var(--color-border-subtle)] bg-slate-900 shadow-md ${className}`}
      >
        <div className={`relative w-full overflow-hidden ${aspectRatioClass}`}>
          {/* Main Slide Image */}
          {activeSlide && !isCurrentFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={activeSlide.id}
              src={activeSlide.url}
              alt={activeSlide.title}
              className="h-full w-full cursor-pointer object-cover transition-all duration-300 group-hover:scale-[1.02]"
              onClick={handleOpenFullscreen}
              onError={() => handleImageError(activeSlide.id)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--color-bg-aqua-fade)] via-[var(--color-mint-bg-alt)] to-[var(--color-sun-lightest)] p-6 text-center text-[var(--color-brand-deep)]">
              <ImageOff
                className="mb-2 h-10 w-10 text-[var(--color-brand-primary)]/60"
                aria-hidden="true"
              />
              <span className="font-heading text-sm font-bold">
                {activeSlide?.title || emptyPlaceholderText}
              </span>
              <span className="mt-1 text-xs font-semibold text-slate-500">
                {emptyPlaceholderText}
              </span>
            </div>
          )}

          {/* Subtle top/bottom vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/65" />

          {/* Top-right Fullscreen Preview Button */}
          {showFullscreenButton && activeSlide && !isCurrentFailed && (
            <button
              type="button"
              onClick={handleOpenFullscreen}
              aria-label="View full screen"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-white hover:bg-black/70 active:scale-95"
            >
              <Maximize2 className="h-4 w-4 drop-shadow-sm" />
            </button>
          )}

          {/* Optional Overlay Children (e.g. badges, stickers, handwritten text) */}
          {overlayChildren}

          {/* Carousel Arrows */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/50 bg-black/45 text-white backdrop-blur-sm transition-all hover:scale-110 hover:border-white hover:bg-black/70 active:scale-95 sm:opacity-85 sm:group-hover:opacity-100"
              >
                <ChevronLeft className="h-6 w-6 drop-shadow-sm" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/50 bg-black/45 text-white backdrop-blur-sm transition-all hover:scale-110 hover:border-white hover:bg-black/70 active:scale-95 sm:opacity-85 sm:group-hover:opacity-100"
              >
                <ChevronRight className="h-6 w-6 drop-shadow-sm" />
              </button>
            </>
          )}

          {/* Bottom-left Photo Counter Badge */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-2xl border border-white/20 bg-black/55 px-3 py-1.5 text-white backdrop-blur-md">
            <Camera className="h-4 w-4 text-[var(--color-sun-yellow-light)]" aria-hidden="true" />
            <span className="text-xs font-black tracking-wide">
              {slides.length > 0 ? `${currentIndex + 1} / ${slides.length}` : "0 / 0"}
            </span>
            {activeSlide?.title && (
              <span className="max-w-[140px] truncate text-[11px] font-medium text-white/80 sm:max-w-[200px]">
                {badgePrefix ? `${badgePrefix} • ` : ""}
                {activeSlide.title}
              </span>
            )}
          </div>

          {/* Bottom-center Interactive Dots */}
          {slides.length > 1 && (
            <div
              role="tablist"
              aria-label="Carousel dots"
              className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/45 px-3.5 py-1.5 backdrop-blur-sm"
            >
              {slides.map((s, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={`${s.id}-${idx}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={(e) => handleDotClick(idx, e)}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "h-2.5 w-6 rounded-full bg-white shadow-md"
                        : "h-2 w-2 rounded-full bg-white/50 hover:bg-white/90"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        images={modalImages}
        initialIndex={currentIndex}
      />
    </>
  );
}

