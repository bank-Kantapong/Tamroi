"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  credit?: string;
}

interface ImageCarouselProps {
  slides: CarouselSlideItem[];
  aspectRatioClass?: string; // e.g. "aspect-[3/4]" or "aspect-[4/3]"
  className?: string;
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
  showFullscreenButton = true,
  emptyPlaceholderText = "ไม่มีรูปภาพ (No photo)",
  initialIndex = 0,
  onIndexChange,
  overlayChildren,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Shuffle animation state
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleDirection, setShuffleDirection] = useState<"next" | "prev">("next");
  const shuffleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) {
        clearTimeout(shuffleTimerRef.current);
      }
    };
  }, []);

  const hasSlides = slides.length > 0;
  const count = slides.length;
  const activeSlide = hasSlides ? slides[currentIndex % count] : null;
  const isCurrentFailed = activeSlide ? Boolean(failedImages[activeSlide.id]) : true;

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!hasSlides || count <= 1 || isShuffling) return;

      setShuffleDirection("next");
      setIsShuffling(true);

      const nextIdx = (currentIndex + 1) % count;
      shuffleTimerRef.current = setTimeout(() => {
        setCurrentIndex(nextIdx);
        onIndexChange?.(nextIdx);
        setIsShuffling(false);
      }, 400);
    },
    [hasSlides, count, isShuffling, currentIndex, onIndexChange]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!hasSlides || count <= 1 || isShuffling) return;

      setShuffleDirection("prev");
      setIsShuffling(true);

      const prevIdx = (currentIndex - 1 + count) % count;
      shuffleTimerRef.current = setTimeout(() => {
        setCurrentIndex(prevIdx);
        onIndexChange?.(prevIdx);
        setIsShuffling(false);
      }, 400);
    },
    [hasSlides, count, isShuffling, currentIndex, onIndexChange]
  );

  const handleGoTo = (targetIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShuffling || targetIdx === currentIndex || !hasSlides || count <= 1) return;

    const dir: "next" | "prev" = targetIdx > currentIndex ? "next" : "prev";
    setShuffleDirection(dir);
    setIsShuffling(true);

    shuffleTimerRef.current = setTimeout(() => {
      setCurrentIndex(targetIdx);
      onIndexChange?.(targetIdx);
      setIsShuffling(false);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleOpenFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasSlides && !isCurrentFailed) {
      setIsFullscreenOpen(true);
    }
  };

  const modalImages: ModalImageItem[] = slides.map((s) => ({
    url: s.url,
    title: s.title,
    subtitle: s.subtitle,
    credit: s.credit,
  }));

  // Determine cards in the stack based on slide count
  const cardBehind1 = count >= 2 ? slides[(currentIndex + 1) % count] : null;
  const cardBehind2 = count >= 3 ? slides[(currentIndex + 2) % count] : null;

  return (
    <>
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Photo cards carousel"
        className={`group relative w-full select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-accent-aqua)]/30 ${className}`}
      >
        <div className={`relative w-full ${aspectRatioClass}`}>
          {hasSlides ? (
            <div className="relative h-full w-full">
              {/* Card 2 Behind (Third in stack - only rendered if count >= 3) */}
              {cardBehind2 && (
                <div
                  style={{
                    transform: isShuffling
                      ? undefined
                      : "translate3d(-6px, 8px, 0) rotate(-2.4deg) scale(0.93)",
                    zIndex: isShuffling ? 15 : 10,
                  }}
                  onClick={() => handleNext()}
                  aria-hidden="true"
                  title="คลิกเพื่อสับเปลี่ยนรูปถัดไป"
                  className={`absolute inset-0 cursor-pointer overflow-hidden rounded-3xl border-2 border-white/80 bg-slate-900 shadow-[0_4px_14px_rgba(7,59,64,0.10)] transition-transform duration-300 ${
                    isShuffling
                      ? shuffleDirection === "next"
                        ? "anim-card-rise-middle"
                        : ""
                      : "hover:-translate-x-2.5 hover:-rotate-[3.2deg]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardBehind2.url}
                    alt=""
                    className="h-full w-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-black/15" />
                </div>
              )}

              {/* Card 1 Behind (Second in stack - rendered if count >= 2) */}
              {cardBehind1 && (
                <div
                  style={{
                    transform: isShuffling
                      ? undefined
                      : "translate3d(8px, 6px, 0) rotate(2.8deg) scale(0.96)",
                    zIndex: isShuffling && shuffleDirection === "next" ? 30 : 20,
                  }}
                  onClick={() => handleNext()}
                  aria-hidden="true"
                  title="คลิกเพื่อสับเปลี่ยนรูปถัดไป"
                  className={`absolute inset-0 cursor-pointer overflow-hidden rounded-3xl border-2 border-white/90 bg-slate-900 shadow-[0_8px_20px_rgba(7,59,64,0.13)] transition-transform duration-300 ${
                    isShuffling
                      ? shuffleDirection === "next"
                        ? "anim-card-rise-front"
                        : ""
                      : "hover:translate-x-2.5 hover:rotate-[3.6deg]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardBehind1.url}
                    alt=""
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              )}

              {/* Active Front Photo Card */}
              {activeSlide && (
                <div
                  style={{
                    transform: isShuffling
                      ? undefined
                      : "translate3d(0, 0, 0) rotate(0deg) scale(1)",
                    zIndex: isShuffling ? 40 : 30,
                  }}
                  className={`absolute inset-0 overflow-hidden rounded-3xl border-2 border-white/95 bg-slate-900 shadow-[0_12px_32px_rgba(7,59,64,0.20)] transition-all duration-300 ${
                    isShuffling
                      ? shuffleDirection === "next"
                        ? "anim-card-shuffle-next-out"
                        : "anim-card-shuffle-prev-out"
                      : ""
                  }`}
                >
                  {!isCurrentFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={activeSlide.id}
                      src={activeSlide.url}
                      alt={activeSlide.title}
                      className="h-full w-full cursor-pointer object-cover transition-all duration-300 hover:scale-[1.02]"
                      onClick={() => handleOpenFullscreen()}
                      onError={() => handleImageError(activeSlide.id)}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--color-bg-aqua-fade)] via-[var(--color-mint-bg-alt)] to-[var(--color-sun-lightest)] p-6 text-center text-[var(--color-brand-deep)]">
                      <ImageOff
                        className="mb-2 h-10 w-10 text-[var(--color-brand-primary)]/60"
                        aria-hidden="true"
                      />
                      <span className="font-heading text-sm font-bold">
                        {activeSlide.title || emptyPlaceholderText}
                      </span>
                      <span className="mt-1 text-xs font-semibold text-slate-500">
                        {emptyPlaceholderText}
                      </span>
                    </div>
                  )}

                  {/* Subtle top/bottom vignette for contrast */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

                  {/* Top-right Fullscreen Preview Button */}
                  {showFullscreenButton && !isCurrentFailed && (
                    <button
                      type="button"
                      onClick={handleOpenFullscreen}
                      aria-label="View full screen"
                      className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-white hover:bg-black/70 active:scale-95"
                    >
                      <Maximize2 className="h-4 w-4 drop-shadow-sm" />
                    </button>
                  )}

                  {/* Overlay Children (badges, stickers, handwritten text) */}
                  {overlayChildren}

                  {/* Bottom-left Photo Credit Tag (แสดงเฉพาะเมื่อมี credit เท่านั้น) */}
                  {activeSlide?.credit && (
                    <div className="absolute bottom-3 left-3 z-30 flex max-w-[calc(100%-2rem)] items-center gap-1.5 rounded-2xl border border-white/20 bg-black/60 px-3 py-1.5 text-white shadow-sm backdrop-blur-md">
                      <Camera
                        className="h-3.5 w-3.5 shrink-0 text-[var(--color-sun-yellow-light)]"
                        aria-hidden="true"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                        Photo:
                      </span>
                      <span className="max-w-[180px] truncate text-xs font-semibold text-white sm:max-w-[260px]">
                        {activeSlide.credit}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--color-border-subtle)] bg-white/70 p-6 text-center text-[var(--color-brand-deep)]">
              <ImageOff
                className="mb-2 h-10 w-10 text-[var(--color-brand-primary)]/50"
                aria-hidden="true"
              />
              <span className="font-heading text-sm font-bold text-slate-500">
                {emptyPlaceholderText}
              </span>
            </div>
          )}

          {/* Carousel Shuffle Arrow Controls */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={isShuffling}
                aria-label="Previous photo card"
                className="absolute left-1 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-white/90 text-[var(--color-brand-deep)] shadow-[0_4px_14px_rgba(7,59,64,0.22)] backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:text-[var(--color-brand-primary)] active:scale-95 disabled:opacity-60 sm:-left-3"
              >
                <ChevronLeft className="h-6 w-6 drop-shadow-sm" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isShuffling}
                aria-label="Next photo card"
                className="absolute right-1 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-white/90 text-[var(--color-brand-deep)] shadow-[0_4px_14px_rgba(7,59,64,0.22)] backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:text-[var(--color-brand-primary)] active:scale-95 disabled:opacity-60 sm:-right-3"
              >
                <ChevronRight className="h-6 w-6 drop-shadow-sm" />
              </button>
            </>
          )}

          {/* Bottom-center Interactive Dots (Indicator of current card in stack) */}
          {count > 1 && (
            <div
              role="tablist"
              aria-label="Photo card indicators"
              className="absolute -bottom-1 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/80 bg-black/45 px-3 py-1.5 shadow-sm backdrop-blur-md"
            >
              {slides.map((s, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={`${s.id}-${idx}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`Go to photo ${idx + 1}`}
                    onClick={(e) => handleGoTo(idx, e)}
                    className={`transition-all duration-300 ${
                      isSelected
                        ? "h-2.5 w-6 rounded-full bg-[var(--color-sun-yellow-light)] shadow-sm"
                        : "h-2 w-2 rounded-full bg-white/60 hover:bg-white/90"
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
