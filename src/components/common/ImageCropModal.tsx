"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Crop,
  RefreshCw,
  Magnet,
} from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number; // 3/4 = 0.75
}

export function ImageCropModal({
  isOpen,
  file,
  onClose,
  onCropComplete,
  aspectRatio = 3 / 4,
}: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const [cropBoxSize, setCropBoxSize] = useState<{ width: number; height: number }>({
    width: 310,
    height: 310 / aspectRatio,
  });

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartZoom = useRef<number>(1);

  const cropBoxRef = useRef<HTMLDivElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Measure crop box layout size precisely with ResizeObserver
  useEffect(() => {
    if (!isOpen) return;

    const measureBox = () => {
      if (cropBoxRef.current) {
        const rect = cropBoxRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setCropBoxSize({ width: rect.width, height: rect.height });
        }
      }
    };

    measureBox();

    let observer: ResizeObserver | null = null;
    if (cropBoxRef.current && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        measureBox();
      });
      observer.observe(cropBoxRef.current);
    }

    window.addEventListener("resize", measureBox);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", measureBox);
    };
  }, [isOpen, aspectRatio]);

  // Load file and measure natural dimensions
  useEffect(() => {
    if (!file || !isOpen) {
      setImgSrc(null);
      setNaturalDimensions({ width: 0, height: 0 });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setImgSrc(src);

      const img = new Image();
      img.onload = () => {
        const nw = img.naturalWidth || 800;
        const nh = img.naturalHeight || 600;
        setNaturalDimensions({ width: nw, height: nh });
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [file, isOpen, aspectRatio]);

  // Derived dimensions taking rotation into account
  const isRotated90 = rotation === 90 || rotation === 270;
  const orientedW = isRotated90 ? naturalDimensions.height : naturalDimensions.width;
  const orientedH = isRotated90 ? naturalDimensions.width : naturalDimensions.height;

  // Base scale required to completely cover the crop aperture (with 1.5px subpixel anti-aliasing safety buffer)
  const baseScale =
    orientedW > 0 && orientedH > 0 && cropBoxSize.width > 0
      ? Math.max(
          (cropBoxSize.width + 1.5) / orientedW,
          (cropBoxSize.height + 1.5) / orientedH
        )
      : 1;

  const currentScale = baseScale * zoom;
  const renderedW = orientedW * currentScale;
  const renderedH = orientedH * currentScale;

  // Strict magnetic clamp bounds: pan is mathematically restricted so the image ALWAYS completely covers the aperture
  const maxPanX = Math.max(0, (renderedW - cropBoxSize.width) / 2);
  const maxPanY = Math.max(0, (renderedH - cropBoxSize.height) / 2);

  // Enforce magnetic clamp whenever scale, dimensions, rotation, or box size changes
  useEffect(() => {
    setPan((p) => {
      const clampedX = Math.min(maxPanX, Math.max(-maxPanX, p.x));
      const clampedY = Math.min(maxPanY, Math.max(-maxPanY, p.y));
      if (clampedX === p.x && clampedY === p.y) return p;
      return { x: clampedX, y: clampedY };
    });
  }, [maxPanX, maxPanY]);

  // Mouse drag handlers with strict magnetic edge locking (Zero Black Edge)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const rawX = e.clientX - dragStart.x;
      const rawY = e.clientY - dragStart.y;

      // Strict magnetic clamp: image CANNOT move past the aperture edge
      const clampedX = Math.min(maxPanX, Math.max(-maxPanX, rawX));
      const clampedY = Math.min(maxPanY, Math.max(-maxPanY, rawY));

      // Keep dragStart aligned to clamp boundary so reverse drag is immediate
      if (rawX !== clampedX || rawY !== clampedY) {
        setDragStart({
          x: e.clientX - clampedX,
          y: e.clientY - clampedY,
        });
      }

      setPan({ x: clampedX, y: clampedY });
    },
    [isDragging, dragStart, maxPanX, maxPanY]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch drag & pinch-to-zoom handlers with strict magnetic edge locking
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDist.current = dist;
      pinchStartZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const rawX = e.touches[0].clientX - dragStart.x;
      const rawY = e.touches[0].clientY - dragStart.y;

      const clampedX = Math.min(maxPanX, Math.max(-maxPanX, rawX));
      const clampedY = Math.min(maxPanY, Math.max(-maxPanY, rawY));

      if (rawX !== clampedX || rawY !== clampedY) {
        setDragStart({
          x: e.touches[0].clientX - clampedX,
          y: e.touches[0].clientY - clampedY,
        });
      }

      setPan({ x: clampedX, y: clampedY });
    } else if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDist.current;
      const nextZoom = Math.max(1, Math.min(3.5, pinchStartZoom.current * ratio));
      setZoom(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pinchStartDist.current = null;
  };

  // Safe Zoom handler that automatically clamps pan so image never uncovers aperture
  const handleZoomChange = (nextZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3.5, nextZoom));
    setZoom(clampedZoom);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    handleZoomChange(Number((zoom + delta).toFixed(2)));
  };

  // Reset to initial state
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Rotate 90 degrees with orientation swap and automatic boundary clamping
  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  // Apply Crop to Canvas (Pixel-perfect matching screen preview with zero black border)
  const handleApplyCrop = () => {
    if (
      !cropBoxRef.current ||
      !imgSrc ||
      !naturalDimensions.width ||
      !naturalDimensions.height
    )
      return;

    const W_box = cropBoxSize.width;

    // Export Resolution: High resolution 3:4 portrait (1440 x 1920)
    const targetWidth = 1440;
    const targetHeight = Math.round(targetWidth / aspectRatio); // 1920

    // Exact scale factor between screen crop box and exported canvas
    const resolutionScale = targetWidth / W_box;

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Enforce magnetic clamp on canvas export coordinates
    const safePanX = Math.min(maxPanX, Math.max(-maxPanX, pan.x));
    const safePanY = Math.min(maxPanY, Math.max(-maxPanY, pan.y));

    // Recreate the exact CSS transform sequence in canvas:
    // 1. Translate to canvas center
    ctx.translate(targetWidth / 2, targetHeight / 2);

    // 2. Translate by pan (scaled to canvas coordinates)
    ctx.translate(safePanX * resolutionScale, safePanY * resolutionScale);

    // 3. Rotate around center
    ctx.rotate((rotation * Math.PI) / 180);

    // 4. Scale by finalScale = (baseScale * zoom) * resolutionScale
    const finalScale = baseScale * zoom * resolutionScale;
    ctx.scale(finalScale, finalScale);

    // 5. Draw image centered
    const executeExport = (sourceImg: CanvasImageSource) => {
      ctx.drawImage(
        sourceImg,
        -naturalDimensions.width / 2,
        -naturalDimensions.height / 2,
        naturalDimensions.width,
        naturalDimensions.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob);
            onClose();
          }
        },
        "image/webp",
        0.92
      );
    };

    if (
      imageElementRef.current &&
      imageElementRef.current.complete &&
      imageElementRef.current.naturalWidth > 0
    ) {
      executeExport(imageElementRef.current);
    } else {
      const img = new Image();
      img.onload = () => executeExport(img);
      img.src = imgSrc;
    }
  };

  const handleSkipCrop = () => {
    if (file) {
      onCropComplete(file);
      onClose();
    }
  };

  if (!isOpen || !imgSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-md animate-fade-up">
      <div className="relative flex flex-col w-full max-w-xl rounded-3xl bg-neutral-950 shadow-2xl overflow-hidden border border-white/10 text-white">
        {/* Header - Instagram Style Dark Theme */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-neutral-900/90 backdrop-blur-sm">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
            aria-label="ปิด"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-brand-primary)] text-white text-xs font-black">
              <Crop className="h-3.5 w-3.5" />
            </span>
            <h3 className="font-heading text-sm font-black tracking-tight text-white">
              ครอบตัดรูปภาพ 3:4
            </h3>
          </div>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="cute-btn inline-flex items-center gap-1.5 border border-teal-500 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-teal-deep)] text-white font-black py-1.5 px-4 rounded-xl text-xs shadow-md transition active:scale-95"
          >
            <Check className="h-3.5 w-3.5" />
            <span>ยืนยัน</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* INSTAGRAM-STYLE CROP VIEWPORT WITH TRANSLUCENT OVERLAY & STRICT MAGNET    */}
        {/* ========================================================================= */}
        <div
          className="relative w-full h-[400px] sm:h-[480px] bg-neutral-950 flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {/* Layer 1: Full Image (Draggable & Zoomable with Strict Magnetic Bounds) */}
          {naturalDimensions.width > 0 && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              ref={imageElementRef}
              src={imgSrc}
              alt="Crop target"
              draggable={false}
              style={{
                width: naturalDimensions.width,
                height: naturalDimensions.height,
                maxWidth: "none",
                maxHeight: "none",
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: -naturalDimensions.width / 2,
                marginTop: -naturalDimensions.height / 2,
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) rotate(${rotation}deg) scale(${currentScale})`,
                transformOrigin: "center center",
                transition: isDragging
                  ? "none"
                  : "transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Layer 2: Instagram Translucent Scrim Overlay with 3:4 Clear Aperture */}
          <div
            ref={cropBoxRef}
            className="pointer-events-none relative aspect-[3/4] w-[260px] sm:w-[310px] max-h-[88%] rounded-2xl"
            style={{
              // Instagram signature dark translucent scrim masking the outside
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.62)",
            }}
          >
            {/* Crisp 3:4 White Border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-white/90 shadow-sm" />

            {/* Instagram Rule-of-Thirds Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none rounded-2xl overflow-hidden">
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div />
            </div>

            {/* Instagram Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />

            {/* 3:4 Badge & Hint */}
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-black text-white/90 backdrop-blur-sm">
              <span>3:4</span>
            </div>

            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur-sm">
              <Magnet className="h-3 w-3 text-teal-400" />
              <span>แม่เหล็กดูดขอบอัตโนมัติ</span>
            </div>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-neutral-900 px-5 py-3.5 text-xs text-neutral-300">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.2)}
              disabled={zoom <= 1}
              className="rounded-lg border border-white/15 p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-white transition disabled:opacity-40"
              title="ซูมออก"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <input
              type="range"
              min="1"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="w-24 sm:w-36 accent-[var(--color-brand-primary)] cursor-pointer"
            />

            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.2)}
              disabled={zoom >= 3.5}
              className="rounded-lg border border-white/15 p-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-white transition disabled:opacity-40"
              title="ซูมเข้า"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <span className="text-[11px] font-mono font-bold text-neutral-400 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Buttons: Rotate & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-neutral-800 px-2.5 py-1.5 text-xs font-bold text-neutral-200 hover:bg-neutral-700 transition active:scale-95"
              title="หมุน 90 องศา"
            >
              <RotateCw className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" />
              <span>หมุน 90°</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-neutral-800 px-2.5 py-1.5 text-xs font-bold text-neutral-200 hover:bg-neutral-700 transition active:scale-95"
              title="รีเซ็ตตำแหน่ง"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>รีเซ็ต</span>
            </button>

            <button
              type="button"
              onClick={handleSkipCrop}
              className="inline-flex items-center rounded-xl border border-white/15 bg-transparent px-2.5 py-1.5 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="ใช้รูปเดิมโดยไม่ครอบตัด"
            >
              ใช้รูปเดิม
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
