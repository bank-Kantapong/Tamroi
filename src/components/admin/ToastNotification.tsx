"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  durationMs?: number;
}

function SingleToast({
  toast,
  onDismiss,
  durationMs = 5000,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  durationMs?: number;
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercent = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remainingPercent);
      if (remainingPercent <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [toast.id, durationMs, onDismiss]);

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  const borderColor = isSuccess
    ? "border-emerald-300"
    : isError
    ? "border-rose-300"
    : "border-sky-300";

  const bgColor = isSuccess
    ? "bg-white"
    : isError
    ? "bg-white"
    : "bg-white";

  const progressBg = isSuccess
    ? "bg-emerald-500"
    : isError
    ? "bg-rose-500"
    : "bg-sky-500";

  const icon = isSuccess ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
  ) : isError ? (
    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
  ) : (
    <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
  );

  return (
    <div
      role="alert"
      className={`relative w-80 sm:w-96 overflow-hidden rounded-2xl border ${borderColor} ${bgColor} shadow-xl p-3.5 text-xs text-slate-800 animate-fade-in transition-all`}
    >
      <div className="flex items-start gap-2.5">
        {icon}
        <div className="flex-1 font-bold leading-relaxed">{toast.message}</div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition shrink-0"
          title="ปิดการแจ้งเตือน"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className={`h-full ${progressBg} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
  durationMs = 5000,
}: ToastNotificationProps) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-auto">
      {toasts.map((toast) => (
        <SingleToast
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          durationMs={durationMs}
        />
      ))}
    </div>
  );
}

