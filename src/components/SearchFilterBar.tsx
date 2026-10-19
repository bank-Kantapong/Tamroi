"use client";

import React, { useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeCategoryName, localizeProvinceName } from "@/lib/i18n-trips";
import { CustomDropdown, DropdownOption } from "@/components/CustomDropdown";
import { useFilterStore } from "@/stores/useFilterStore";

interface SearchFilterBarProps {
  provinces: string[];
  categories: string[];
  currentFilters: TripFilterParams;
}

export function SearchFilterBar({
  provinces,
  categories,
  currentFilters,
}: SearchFilterBarProps) {
  const { locale, t } = useLanguage();

  // Zustand Filter Store
  const {
    q,
    province,
    category,
    duration,
    maxBudget,
    isLoading,
    totalCount,
    setQ,
    setProvince,
    setCategory,
    setDuration,
    setMaxBudget,
    initFromParams,
    resetFilters,
    hasActiveFilters,
    fetchTrips,
  } = useFilterStore();

  useEffect(() => {
    initFromParams(currentFilters);
  }, [currentFilters, initFromParams]);

  const isFiltering = hasActiveFilters();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchTrips();
  };

  const handleReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    resetFilters();
    // After clearing store values, immediately trigger fetch
    setTimeout(() => {
      void fetchTrips();
    }, 0);
  };

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
      badgeColor: "var(--color-mint-border)",
    },
    {
      value: "half-day",
      label: t.search.halfDay,
      badgeColor: "var(--color-brand-cyan)",
    },
    {
      value: "full-day",
      label: t.search.fullDay,
      badgeColor: "var(--color-coral-accent)",
    },
    {
      value: "multi-day",
      label: t.search.multiDay,
      badgeColor: "var(--color-brand-primary)",
    },
  ];

  return (
    <section
      aria-label={t.search.sectionLabel}
      className="cute-card relative z-20 p-5 backdrop-blur-md transition-all sm:p-6"
    >
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
          {/* Search query input */}
          <div className="md:col-span-5">
            <label
              htmlFor="search-q"
              className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[var(--color-brand-primary)]"
            >
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
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.search.searchPlaceholder}
                className="w-full rounded-2xl border-2 border-[var(--color-border-subtle)] bg-white/90 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all hover:border-[var(--color-brand-cyan)] focus:border-[var(--color-brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-aqua)]/20"
              />
            </div>
          </div>

          {/* Province dropdown */}
          <div className="md:col-span-3">
            <label
              htmlFor="filter-province"
              className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[var(--color-brand-primary)]"
            >
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
              className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[var(--color-brand-primary)]"
            >
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

          {/* Max Budget input */}
          <div className="md:col-span-2">
            <label
              htmlFor="filter-budget"
              className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[var(--color-brand-primary)]"
            >
              {t.search.maxBudgetLabel}
            </label>
            <div className="relative">
              <Wallet
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-brand-primary)]"
                aria-hidden="true"
              />
              <input
                id="filter-budget"
                name="maxBudget"
                type="number"
                min={0}
                step={100}
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder={t.search.budgetPlaceholder}
                className="w-full rounded-2xl border-2 border-[var(--color-border-subtle)] bg-white/90 py-2.5 pl-9 pr-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition-all hover:border-[var(--color-brand-cyan)] focus:border-[var(--color-brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-aqua)]/20"
              />
            </div>
          </div>
        </div>

        {/* Action Row: Duration Filter + Result Counts + Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-[var(--color-border-subtle)] pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-[var(--color-brand-deep)]">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
              <span>{t.search.durationLabel}</span>
            </div>
            <div className="w-56">
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

            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-border-alt)] bg-[var(--color-bg-card-photo)] px-3.5 py-1 text-xs font-black text-[var(--color-brand-deep)]">
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-brand-primary)]" aria-hidden="true" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
              )}
              {t.search.showingPrefix} {totalCount} {t.search.showingUnit}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {isFiltering && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] px-4 py-2 text-xs font-black text-[var(--color-coral-text-dark)] transition-transform hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {t.search.resetFilters}
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="cute-primary-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {t.search.applyFilters}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
