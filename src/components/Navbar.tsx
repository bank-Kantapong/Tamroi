"use client";

import Link from "next/link";
import { Route, ShieldCheck, Globe, Sparkles, Compass } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function Navbar() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--color-border-subtle)] bg-white/90 shadow-sm backdrop-blur-md">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-[var(--color-brand-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t.nav.skipToContent}
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 text-slate-900 transition hover:text-[var(--color-brand-primary)]"
        >
          {/* Cute Rounded Route Badge Icon matching the Visual Guide */}
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-accent-aqua)] text-white shadow-[0_4px_0_rgba(9,124,135,0.25)] transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
            <Route className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-black tracking-tight text-[var(--color-brand-deep)] sm:text-xl">
                TAMROI
              </span>
              <span className="inline-flex -rotate-2 items-center gap-1 rounded-full border-2 border-white bg-[var(--color-sun-yellow-light)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-sun-text)] shadow-sm transition-transform group-hover:rotate-2">
                <Sparkles className="h-3 w-3 text-[var(--color-sun-amber)]" aria-hidden="true" />
                ตามรอย
              </span>
            </div>
            <p className="hidden text-xs font-medium text-[var(--color-brand-primary)]/80 sm:block">
              {t.nav.tagline}
            </p>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-full border-2 border-transparent bg-[var(--color-bg-card-photo)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-brand-primary)] transition-all hover:border-[var(--color-accent-aqua)] hover:bg-[var(--color-bg-aqua-fade)] sm:inline-flex"
          >
            <Compass className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
            {t.nav.explore}
          </Link>

          {/* Cute Language Switcher Pill (TH default / EN) */}
          <div
            role="group"
            aria-label={t.nav.langSwitchLabel}
            className="inline-flex items-center rounded-full border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] p-1 shadow-[0_3px_0_rgba(9,124,135,0.12)]"
          >
            <Globe
              className="ml-2 mr-1 hidden h-3.5 w-3.5 text-[var(--color-brand-primary)] sm:inline"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setLocale("th")}
              aria-pressed={locale === "th"}
              className={`rounded-full px-3 py-1 text-xs font-extrabold transition-all duration-200 ${
                locale === "th"
                  ? "bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-sm"
                  : "text-[var(--color-brand-deep)]/75 hover:text-[var(--color-brand-primary)]"
              }`}
            >
              ไทย
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={`rounded-full px-3 py-1 text-xs font-extrabold transition-all duration-200 ${
                locale === "en"
                  ? "bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-sm"
                  : "text-[var(--color-brand-deep)]/75 hover:text-[var(--color-brand-primary)]"
              }`}
            >
              EN
            </button>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-[0_3px_0_rgba(9,124,135,0.14)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)]"
          >
            <ShieldCheck className="h-4 w-4 text-[var(--color-brand-primary)]" aria-hidden="true" />
            <span className="hidden md:inline">{t.nav.admin}</span>
            <span className="md:hidden">Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
