"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TripFilterParams } from "@/types/trip";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Compass,
  Clock,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeCategoryName, localizeProvinceName } from "@/lib/i18n-trips";
import { CustomDropdown, DropdownOption } from "@/components/CustomDropdown";

interface SearchFilterBarProps {
  provinces: string[];
  categories: string[];
  currentFilters: TripFilterParams;
  totalCount: number;
}

export function SearchFilterBar({
  provinces,
  categories,
  currentFilters,
  totalCount,
}: SearchFilterBarProps) {
  const { locale, t } = useLanguage();
  const [province, setProvince] = useState(currentFilters.province || "");
  const [category, setCategory] = useState(currentFilters.category || "");
  const [duration, setDuration] = useState(currentFilters.duration || "");

  useEffect(() => {
    setProvince(currentFilters.province || "");
    setCategory(currentFilters.category || "");
    setDuration(currentFilters.duration || "");
  }, [currentFilters.province, currentFilters.category, currentFilters.duration]);

  const hasActiveFilters = Boolean(
    currentFilters.q ||
      currentFilters.province ||
      currentFilters.category ||
      currentFilters.maxBudget ||
      currentFilters.duration
  );

  const provinceOptions: DropdownOption[] = [
    {
      value: "",
      label: t.search.allProvinces,
      badgeColor: "var(--color-brand-cyan)",
    },
    ...provinces.map((prov) => ({
      value: prov,
      label: localizeProvinceName(prov, locale),
      badgeColor: "var(--color-brand-primary)",
    })),
  ];

  const categoryOptions: DropdownOption[] = [
    {
      value: "",
      label: t.search.allCategories,
      badgeColor: "var(--color-coral-accent)",
    },
    ...categories.map((cat) => ({
      value: cat,
      label: localizeCategoryName(cat, locale),
      badgeColor: "var(--color-sun-yellow)",
    })),
  ];

  const durationOptions: DropdownOption[] = [
    {
      value: "",
      label: t.search.anyDuration,
      badgeColor: "var(--color-sage-dark)",
    },
    {
      value: "half-day",
      label: t.search.halfDay,
      badgeColor: "var(--color-brand-cyan)",
    },
    {
      value: "full-day",
      label: t.search.fullDay,
      badgeColor: "var(--color-sun-yellow)",
    },
    {
      value: "multi-day",
      label: t.search.multiDay,
      badgeColor: "var(--color-coral-accent)",
    },
  ];

  return (
    <section
      aria-label={t.search.sectionLabel}
      className="cute-card relative z-20 p-5 transition-all sm:p-6"
    >
      {/* Cute Floating Corner Sticker */}
      <div
        className="pointer-events-none absolute -top-3.5 right-6 hidden -rotate-2 items-center gap-1.5 rounded-full border-2 border-white bg-[var(--color-sun-yellow-light)] px-3 py-1 text-[11px] font-extrabold text-[var(--color-sun-text)] shadow-md sm:inline-flex"
        aria-hidden="true"
      >
        <Sparkles className="h-3.5 w-3.5 text-[var(--color-sun-amber)]" />
        <span>
          {locale === "th" ? "ค้นหาทริปตามสไตล์คุณ ♡" : "Find Your Dream Route ♡"}
        </span>
      </div>

      <form method="GET" action="/" className="space-y-4">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
          {/* Search query */}
          <div className="md:col-span-5">
            <label
              htmlFor="search-q"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-primary)]"
            >
              <Search className="h-3.5 w-3.5 text-[var(--color-brand-cyan)]" aria-hidden="true" />
              {t.search.searchLabel}
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />
              <input
                id="search-q"
                name="q"
                type="search"
                defaultValue={currentFilters.q || ""}
                placeholder={t.search.searchPlaceholder}
                className="w-full rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] py-2.5 pl-10 pr-4 text-sm font-bold text-[var(--color-brand-deep)] shadow-[0_3px_0_rgba(9,124,135,0.08)] placeholder:font-medium placeholder:text-slate-400 transition-all hover:border-[var(--color-accent-aqua)] focus:border-[var(--color-brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-aqua)]/20"
              />
            </div>
          </div>

          {/* Province dropdown */}
          <div className="md:col-span-3">
            <label
              htmlFor="filter-province"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-primary)]"
            >
              <MapPin className="h-3.5 w-3.5 text-[var(--color-brand-cyan)]" aria-hidden="true" />
              {t.search.provinceLabel}
            </label>
            <CustomDropdown
              id="filter-province"
              name="province"
              value={province}
              onChange={setProvince}
              options={provinceOptions}
              icon={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />}
              ariaLabel={t.search.provinceLabel}
            />
          </div>

          {/* Category dropdown */}
          <div className="md:col-span-2">
            <label
              htmlFor="filter-category"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-primary)]"
            >
              <Compass className="h-3.5 w-3.5 text-[var(--color-coral-accent)]" aria-hidden="true" />
              {t.search.categoryLabel}
            </label>
            <CustomDropdown
              id="filter-category"
              name="category"
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              icon={<Compass className="h-3.5 w-3.5" aria-hidden="true" />}
              ariaLabel={t.search.categoryLabel}
            />
          </div>

          {/* Max Budget */}
          <div className="md:col-span-2">
            <label
              htmlFor="filter-budget"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-primary)]"
            >
              <Wallet className="h-3.5 w-3.5 text-[var(--color-sun-amber)]" aria-hidden="true" />
              {t.search.maxBudgetLabel}
            </label>
            <input
              id="filter-budget"
              name="maxBudget"
              type="number"
              min={0}
              step={100}
              defaultValue={currentFilters.maxBudget ?? ""}
              placeholder={t.search.budgetPlaceholder}
              className="w-full rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] px-3.5 py-2.5 text-sm font-bold text-[var(--color-brand-deep)] shadow-[0_3px_0_rgba(9,124,135,0.08)] placeholder:font-medium placeholder:text-slate-400 transition-all hover:border-[var(--color-accent-aqua)] focus:border-[var(--color-brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-aqua)]/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-[var(--color-border-subtle)] pt-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--color-brand-deep)]">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
              <span>{t.search.durationLabel}</span>
            </div>
            <div className="w-60">
              <CustomDropdown
                id="filter-duration"
                name="duration"
                value={duration}
                onChange={setDuration}
                options={durationOptions}
                icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}
                ariaLabel={t.search.durationLabel}
              />
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-mint-border-alt)] bg-[var(--color-mint-bg-alt)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-mint-text-dark)] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-mint-icon)]" aria-hidden="true" />
              {t.search.showingPrefix} {totalCount} {t.search.showingUnit}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {hasActiveFilters && (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] px-4 py-2 text-xs font-extrabold text-[var(--color-coral-text-dark)] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--color-coral-border-alt)]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {t.search.resetFilters}
              </Link>
            )}
            <button
              type="submit"
              className="cute-yellow-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              {t.search.applyFilters}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
