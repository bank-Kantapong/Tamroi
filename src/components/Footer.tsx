"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Route, Heart, Sparkles, MapPin } from "lucide-react";

export function Footer() {
  const { locale, t } = useLanguage();

  return (
    <footer className="mt-16 border-t-2 border-dashed border-[var(--color-border-subtle)] bg-gradient-to-b from-white/95 to-[var(--color-bg-aqua-light)] py-10 text-sm text-slate-600">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-accent-aqua)] text-white shadow-sm">
              <Route className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="font-heading text-base font-extrabold text-[var(--color-brand-deep)]">
              TAMROI (ตามรอย)
            </p>
            <span className="inline-flex -rotate-2 items-center gap-1 rounded-full border border-[var(--color-sun-yellow)] bg-[var(--color-sun-lightest)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-sun-text)]">
              <Sparkles className="h-3 w-3 text-[var(--color-sun-amber)]" aria-hidden="true" />
              {locale === "th" ? "เที่ยวตามรอยง่ายๆ ♡" : "Easy Trip Guide ♡"}
            </span>
          </div>
          <p className="mt-2 max-w-xl text-xs font-medium leading-relaxed text-slate-600">
            {t.footer.subtitle}
          </p>
        </div>

        <div className="rounded-2xl border-2 border-[var(--color-border-subtle)] bg-white/90 px-4 py-3 text-xs text-slate-600 shadow-sm sm:text-right">
          <p className="flex items-center gap-1.5 font-semibold text-[var(--color-brand-deep)] sm:justify-end">
            <MapPin className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
            <span>
              {t.footer.osmAttribution} &copy;{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-[var(--color-brand-primary)] underline hover:text-[var(--color-brand-cyan)]"
              >
                OpenStreetMap contributors
              </a>
            </span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 sm:justify-end">
            <Heart className="h-3 w-3 text-[var(--color-coral-accent)]" aria-hidden="true" />
            <span>{t.footer.sampleNote}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
