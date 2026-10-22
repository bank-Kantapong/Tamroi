"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";

interface SaveTripButtonProps {
  tripId: string;
  variant?: "card" | "detail";
  className?: string;
}

export function SaveTripButton({
  tripId,
  variant = "card",
  className = "",
}: SaveTripButtonProps) {
  const { isSaved, toggleSave, user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [animating, setAnimating] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const saved = isSaved(tripId);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowPrompt(true);
      setTimeout(() => setShowPrompt(false), 3000);
      return;
    }

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    await toggleSave(tripId);
  }

  if (variant === "detail") {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleToggle}
          title={saved ? t.saved.unsaveTooltip : t.saved.saveTooltip}
          aria-label={saved ? t.saved.unsaveTooltip : t.saved.saveTooltip}
          className={`inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-xs font-black transition-all duration-200 active:scale-95 ${
            saved
              ? "border-[var(--color-brand-primary)] bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-[0_3px_0_rgba(9,124,135,0.25)]"
              : "border-[var(--color-border-subtle)] bg-white text-[var(--color-brand-deep)] shadow-sm hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)]"
          } ${animating ? "scale-110" : ""} ${className}`}
        >
          <Bookmark
            className={`h-4 w-4 transition-transform duration-200 ${
              saved ? "fill-white text-white scale-110" : "text-[var(--color-brand-primary)]"
            }`}
            aria-hidden="true"
          />
          <span>{saved ? t.saved.unsaveTooltip : t.saved.saveTooltip}</span>
        </button>

        {showPrompt && (
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-900 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
            <p className="mb-2">{t.saved.loginToSave}</p>
            <button
              type="button"
              onClick={() => router.push(`/login?returnTo=/saved`)}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-[var(--color-brand-deep)]"
            >
              {t.nav.login}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Variant: "card"
  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        title={saved ? t.saved.unsaveTooltip : t.saved.saveTooltip}
        aria-label={saved ? t.saved.unsaveTooltip : t.saved.saveTooltip}
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 shadow-md backdrop-blur-sm active:scale-90 ${
          saved
            ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
            : "border-white/80 bg-white/90 text-slate-700 hover:scale-105 hover:bg-white hover:text-[var(--color-brand-primary)]"
        } ${animating ? "scale-125" : ""} ${className}`}
      >
        <Bookmark
          className={`h-4 w-4 transition-all ${
            saved ? "fill-current text-white scale-105" : "text-slate-700 hover:text-[var(--color-brand-primary)]"
          }`}
          aria-hidden="true"
        />
      </button>

      {showPrompt && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl border-2 border-amber-300 bg-white p-2.5 text-xs font-bold text-amber-900 shadow-xl ring-1 ring-black/5 animate-in fade-in">
          <p className="mb-1.5 text-[11px]">{t.saved.loginToSave}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/login");
            }}
            className="block w-full rounded-md bg-[var(--color-brand-primary)] px-2 py-1 text-center text-[11px] font-extrabold text-white"
          >
            {t.nav.login}
          </button>
        </div>
      )}
    </div>
  );
}
