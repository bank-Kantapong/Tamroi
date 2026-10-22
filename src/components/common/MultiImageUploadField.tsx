"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  X,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  Plus,
  Star,
  Crop,
  Layers,
} from "lucide-react";
import { compressImage } from "@/lib/image-compressor";
import { ImageCropModal } from "./ImageCropModal";
import { ImageCarousel, CarouselSlideItem } from "./ImageCarousel";

interface MultiImageUploadFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  helperText?: string;
  className?: string;
  title?: string;
  province?: string;
}

export function MultiImageUploadField({
  images,
  onChange,
  label = "รูปภาพทริป (Trip Photos)",
  helperText = "สามารถอัปโหลดได้หลายรูป หลายครั้ง (ระบบครอบตัด 3:4 และย่อขนาด Full HD ให้อัตโนมัติ)",
  className = "",
  title = "พรีวิวรูปทริป",
  province = "ประเทศไทย",
}: MultiImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Queue of files to crop
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [currentCropFile, setCurrentCropFile] = useState<File | null>(null);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.type.startsWith("image/")) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setError("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPEG, PNG, WebP)");
      return;
    }

    setError(null);

    // Start with the first file in crop queue
    setCurrentCropFile(validFiles[0]);
    setCropQueue(validFiles.slice(1));
  }

  async function handleUploadBlob(blob: Blob) {
    setUploading(true);
    setUploadStatus("กำลังประมวลผลและอัปโหลดรูปภาพ...");

    try {
      // 1. High-quality compression
      const { file: compressedFile, compressedSize } =
        await compressImage(blob, {
          maxDimension: 1920,
          quality: 0.88,
          targetFormat: "image/webp",
        });

      // 2. Upload to server
      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Add newly uploaded image to images array
      onChange([...images, data.url]);

      setUploadStatus(
        `อัปโหลดสำเร็จ! ย่อเหลือ ${(compressedSize / 1024).toFixed(0)} KB`
      );
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลด";
      setError(msg);
      setUploadStatus(null);
    } finally {
      setUploading(false);

      // Check next file in crop queue
      if (cropQueue.length > 0) {
        const next = cropQueue[0];
        setCropQueue((prev) => prev.slice(1));
        setCurrentCropFile(next);
      } else {
        setCurrentCropFile(null);
      }
    }
  }

  function handleRemoveImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleSetAsCover(index: number) {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  }

  function handleAddManualUrl() {
    if (!manualUrl.trim()) return;
    onChange([...images, manualUrl.trim()]);
    setManualUrl("");
  }

  // Build slides for 4:3 Carousel Preview matching TripHeaderPhotoFrame
  const slides: CarouselSlideItem[] = images.map((url, idx) => ({
    id: `photo-${idx}`,
    url,
    title: idx === 0 ? `${title} (รูปหน้าปก)` : `${title} #${idx + 1}`,
    subtitle: province,
    badge: idx === 0 ? "รูปหน้าปกหลัก" : `รูปที่ ${idx + 1}`,
  }));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-[var(--color-brand-primary)]" />
          <span>{label}</span>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-brand-primary)] border border-teal-200">
            {images.length} รูป
          </span>
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-primary)] hover:underline"
        >
          <LinkIcon className="h-3 w-3" />
          <span>{showUrlInput ? "ซ่อนช่อง URL" : "หรือใส่ URL"}</span>
        </button>
      </div>

      {/* Manual URL Input Toggle */}
      {showUrlInput && (
        <div className="animate-fade-up flex items-center gap-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddManualUrl();
              }
            }}
            placeholder="วางลิงก์รูปภาพ https://... แล้วกดปุ่มเพิ่ม"
            className="cute-input w-full text-xs border-2 border-slate-300 py-1.5 px-3 rounded-xl bg-white"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            disabled={!manualUrl.trim()}
            className="cute-btn cute-btn-secondary shrink-0 py-1.5 px-3 text-xs font-black rounded-xl"
          >
            เพิ่ม
          </button>
        </div>
      )}

      {/* Hidden File Input (multiple allowed) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          // reset input so same file can be selected again
          e.target.value = "";
        }}
      />

      {/* Interactive 3:4 Crop Modal */}
      <ImageCropModal
        isOpen={Boolean(currentCropFile)}
        file={currentCropFile}
        onClose={() => {
          setCurrentCropFile(null);
          setCropQueue([]);
        }}
        onCropComplete={handleUploadBlob}
        aspectRatio={3 / 4}
      />

      {/* ========================================================================= */}
      {/* 3:4 PHOTO FRAME PREVIEW (Matches TripHeaderPhotoFrame exact structure)     */}
      {/* ========================================================================= */}
      {images.length > 0 ? (
        <div className="space-y-3">
          {/* 3:4 Interactive Card Carousel */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-300 shadow-md aspect-[3/4] bg-slate-900">
            <ImageCarousel
              slides={slides}
              aspectRatioClass="aspect-[3/4] h-full"
              className="h-full border-none shadow-none rounded-none"
              showFullscreenButton={false}
              emptyPlaceholderText="ไม่มีรูปภาพ"
              initialIndex={0}
            />

            {/* Hint overlay on preview */}
            <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-sm">
                🃏 พรีวิวการ์ดสับเปลี่ยนแบบเดียวกับหน้าค้นหาทริป
              </span>
            </div>
          </div>

          {/* Thumbnail Management Strip */}
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700">
                รายการรูปภาพทั้งหมด ({images.length})
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 text-[11px] font-black text-[var(--color-brand-primary)] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ อัปโหลดรูปเพิ่ม</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5">
              {images.map((url, idx) => {
                const isCover = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`group relative shrink-0 w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition ${
                      isCover
                        ? "border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20 shadow-sm"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {/* Cover badge */}
                    {isCover && (
                      <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded bg-[var(--color-brand-primary)] px-1 py-0.5 text-[8px] font-black text-white shadow-xs">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        ปก
                      </span>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetAsCover(idx)}
                          className="rounded-lg bg-white/90 p-1 text-[10px] font-black text-slate-800 hover:bg-white"
                          title="ตั้งเป็นรูปหน้าปกหลัก"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="rounded-lg bg-rose-500/90 p-1 text-white hover:bg-rose-600"
                        title="ลบรูปนี้"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add More Button in strip */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center justify-center shrink-0 w-20 aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-[var(--color-brand-primary)] hover:bg-teal-50 transition text-slate-500 hover:text-[var(--color-brand-primary)]"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[10px] font-black mt-0.5">เพิ่มรูป</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all aspect-[3/4] max-w-sm mx-auto ${
            isDragOver
              ? "border-[var(--color-brand-primary)] bg-[var(--color-bg-aqua-fade)] scale-[1.01]"
              : "border-slate-300 bg-slate-50/70 hover:border-[var(--color-brand-primary)] hover:bg-white"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-[var(--color-brand-primary)] animate-spin" />
              <p className="text-xs font-bold text-slate-700">
                {uploadStatus || "กำลังอัปโหลด..."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-md">
                <UploadCloud className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-black text-slate-800">
                  คลิกเพื่อเลือกรูป หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 max-w-xs">
                  {helperText}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                  <Crop className="h-3 w-3 text-emerald-500" />
                  ครอบตัด 3:4
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-brand-primary)] border border-teal-200">
                  <Sparkles className="h-3 w-3" />
                  อัปโหลดได้หลายรูป
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload status feedback */}
      {uploadStatus && !uploading && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-fade-up">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{uploadStatus}</span>
        </p>
      )}

      {/* Error feedback */}
      {error && (
        <p className="text-xs font-bold text-rose-600 animate-fade-up">{error}</p>
      )}
    </div>
  );
}
