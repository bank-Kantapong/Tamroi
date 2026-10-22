"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

export interface ModalImageItem {
  url: string;
  title: string;
  subtitle?: string;
  credit?: string;
}

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ModalImageItem[];
  initialIndex?: number;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Handle keyboard events (Escape to close, Left/Right arrow to navigate)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0 || !mounted) return null;

  const currentImage = images[currentIndex % images.length];

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview modal"
      className="fixed inset-0 z-[9999] flex h-screen w-screen flex-col items-center justify-between bg-black/95 p-4 sm:p-6 backdrop-blur-xl animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Top Bar: Title, Count & Close Button */}
      <div
        className="z-[10000] flex min-h-[52px] w-full max-w-7xl items-center justify-between px-2 pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[var(--color-sun-yellow-light)] shadow-sm">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="text-white">
            <h2 className="font-heading text-sm font-black tracking-wide sm:text-base">
              {currentImage.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {currentImage.subtitle && (
                <p className="text-xs font-semibold text-white/70">
                  {currentImage.subtitle}
                </p>
              )}
              {currentImage.credit && (
                <span className="inline-flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white/90">
                  <span className="text-white/60">Photo:</span>
                  <span>{currentImage.credit}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {images.length > 1 && (
            <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-black text-[var(--color-sun-yellow-light)] shadow-sm">
              {currentIndex + 1} / {images.length}
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 text-white transition hover:scale-110 hover:border-white hover:bg-white/20 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Center Image Stage: Fill maximum screen space while maintaining aspect ratio */}
      <div
        className="relative flex h-full w-full flex-1 items-center justify-center p-2 sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentImage.url}
          src={currentImage.url}
          alt={currentImage.title}
          className="max-h-[82vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl transition-opacity duration-200"
        />
      </div>

      {/* Fixed Navigation Buttons: Anchored directly to screen viewport to eliminate any jitter/twitching on click */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous photo"
            className="fixed left-3 top-1/2 z-[10002] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/60 bg-black/70 text-white backdrop-blur-md transition-colors duration-150 hover:border-white hover:bg-black/90 active:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white select-none sm:left-6 sm:h-14 sm:w-14"
          >
            <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next photo"
            className="fixed right-3 top-1/2 z-[10002] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/60 bg-black/70 text-white backdrop-blur-md transition-colors duration-150 hover:border-white hover:bg-black/90 active:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white select-none sm:right-6 sm:h-14 sm:w-14"
          >
            <ChevronRight className="h-7 w-7 sm:h-8 sm:w-8" />
          </button>
        </>
      )}

      {/* Bottom Thumbnail / Dot Indicator Bar */}
      {images.length > 1 && (
        <div
          className="z-[10000] mb-2 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={`${img.url}-${idx}`}
                type="button"
                aria-label={`Go to photo ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-200 ${
                  isSelected
                    ? "h-2.5 w-7 rounded-full bg-[var(--color-sun-yellow-light)] shadow-md"
                    : "h-2 w-2 rounded-full bg-white/50 hover:bg-white/80"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
