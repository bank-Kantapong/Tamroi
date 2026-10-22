"use client";

import { useRef, useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  X,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { compressImage } from "@/lib/image-compressor";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: string;
  className?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label = "รูปภาพ",
  helperText = "รองรับ JPG, PNG, WebP (ย่อขนาดอัตโนมัติคงความคมชัด)",
  aspectRatio = "aspect-[16/10]",
  className = "",
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [compressInfo, setCompressInfo] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleFileProcess(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)");
      return;
    }

    setError(null);
    setUploading(true);
    setCompressInfo("กำลังย่อขนาดภาพด้วยคุณภาพสูง...");

    try {
      // 1. Client-side compression
      const { file: compressedFile, originalSize, compressedSize } =
        await compressImage(file, {
          maxDimension: 1920,
          quality: 0.88,
          targetFormat: "image/webp",
        });

      const savings = Math.max(
        0,
        Math.round(((originalSize - compressedSize) / originalSize) * 100)
      );
      setCompressInfo(
        `ย่อจาก ${formatBytes(originalSize)} เหลือ ${formatBytes(compressedSize)} (${savings}% ลดลง)`
      );

      // 2. Upload to /api/upload
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

      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลด";
      setError(msg);
      setCompressInfo(null);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-700">{label}</label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-primary)] hover:underline"
          >
            <LinkIcon className="h-3 w-3" />
            <span>{showUrlInput ? "ซ่อนช่องกรอก URL" : "หรือใส่ URL รูปภาพเอง"}</span>
          </button>
        </div>
      )}

      {/* Manual URL input fallback if toggled */}
      {showUrlInput && (
        <div className="animate-fade-up flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... หรือ /images/..."
            className="cute-input text-xs"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-xl border border-slate-300 p-2 text-slate-500 hover:bg-slate-100"
              title="ล้างลิงก์"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileProcess(e.target.files[0]);
          }
        }}
      />

      {/* Display Preview or Upload Area */}
      {value ? (
        <div
          className={`relative overflow-hidden rounded-2xl border-2 border-[var(--color-border-card)] bg-[var(--color-bg-card-photo)] shadow-sm ${aspectRatio}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={() => setError("ไม่สามารถโหลดรูปภาพจาก URL นี้ได้")}
          />

          {/* Action overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 flex items-center justify-between">
            <div className="text-[11px] text-white font-bold truncate max-w-[70%]">
              {compressInfo ? (
                <span className="flex items-center gap-1 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{compressInfo}</span>
                </span>
              ) : (
                <span className="text-white/90 truncate">{value}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-xl bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm backdrop-blur-sm hover:bg-white active:scale-95 transition"
              >
                <RefreshCw className="h-3 w-3 text-[var(--color-brand-primary)]" />
                <span>เปลี่ยนรูป</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setCompressInfo(null);
                }}
                className="rounded-xl bg-rose-500/90 p-1 text-white shadow-sm hover:bg-rose-600 active:scale-95 transition"
                title="ลบรูปภาพ"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-[var(--color-brand-primary)] bg-[var(--color-bg-aqua-fade)] scale-[1.01]"
              : "border-slate-300 bg-slate-50/70 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)]"
          } ${aspectRatio}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-[var(--color-brand-primary)] animate-spin" />
              <p className="text-xs font-bold text-[var(--color-brand-deep)]">
                {compressInfo || "กำลังประมวลผล..."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-md">
                <UploadCloud className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-black text-slate-800">
                  คลิกเพื่ออัปโหลดรูปภาพ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  {helperText}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                ย่อไฟล์อัตโนมัติ รักษาความคมชัด
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-bold text-rose-600 animate-fade-up">{error}</p>
      )}
    </div>
  );
}
