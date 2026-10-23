"use client";

import { AlertTriangle, Info, Trash2 } from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === "danger";
  const isWarning = variant === "warning";

  const icon = isDanger ? (
    <Trash2 className="h-5 w-5 text-rose-600" />
  ) : isWarning ? (
    <AlertTriangle className="h-5 w-5 text-amber-600" />
  ) : (
    <Info className="h-5 w-5 text-sky-600" />
  );

  const confirmBtnBg = isDanger
    ? "bg-rose-600 hover:bg-rose-700 text-white"
    : isWarning
    ? "bg-amber-600 hover:bg-amber-700 text-white"
    : "bg-teal-600 hover:bg-teal-700 text-white";

  const headerBorder = isDanger
    ? "border-rose-100"
    : isWarning
    ? "border-amber-100"
    : "border-slate-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-up">
        <div className={`flex items-center gap-2.5 pb-3 border-b ${headerBorder}`}>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            {icon}
          </div>
          <h3 className="font-heading text-base font-black text-slate-900">
            {title}
          </h3>
        </div>

        <div className="mt-3 text-xs text-slate-600 leading-relaxed font-medium">
          {description}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 ${confirmBtnBg}`}
          >
            {isLoading ? "กำลังดำเนินการ..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
