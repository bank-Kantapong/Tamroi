"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { TripListItem, TripFilterParams } from "@/types/trip";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { TripCard } from "@/components/trip/TripCard";
import { TripCardSkeletonGrid } from "@/components/skeleton";
import { useLanguage } from "@/components/LanguageProvider";
import { HomeHeroInfographic } from "./HomeHeroInfographic";
import { CurvedUnderline } from "@/components/illustrations";
import { useFilterStore } from "@/stores/useFilterStore";
import {
  MapPin,
  Navigation,
  Compass,
  Sparkles,
} from "lucide-react";

interface HomeClientProps {
  trips: TripListItem[];
  metadata: {
    provinces: string[];
    categories: string[];
  };
  filters: TripFilterParams;
}

export function HomeClient({
  trips: initialTrips,
  metadata,
  filters,
}: HomeClientProps) {
  const { locale, t } = useLanguage();

  // Zustand filter store for dynamic trips & async loading
  const { trips, isLoading, initFromParams } = useFilterStore();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      initFromParams(filters, initialTrips);
      isFirstMount.current = false;
    }
  }, [filters, initialTrips, initFromParams]);

  // Fallback to initialTrips if store is not yet initialized
  const displayTrips = trips.length > 0 || !isFirstMount.current ? trips : initialTrips;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with Cute Scrapbook Visual Infographic */}
      <section className="relative overflow-hidden rounded-b-[3rem] border-b-4 border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--color-brand-deep)] via-[var(--color-brand-primary)] to-[var(--color-brand-primary)] pb-24 pt-10 text-white shadow-2xl shadow-[var(--color-brand-primary)]/20 sm:pb-28 sm:pt-14">
        {/* Tropical Jade Sunrise ambient glow blobs */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[var(--color-accent-aqua)]/25 blur-3xl animate-float-slow"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-12 right-1/4 h-72 w-72 rounded-full bg-[var(--color-sun-yellow-light)]/15 blur-3xl animate-pulse-soft"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-6 h-96 w-96 rounded-full bg-[var(--color-peach)]/25 blur-3xl animate-pulse-soft"
          aria-hidden="true"
        />

        {/* Subtle dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1.25px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Left Column: Cute Scrapbook Headline + Pastel Pills + Metric Card */}
            <div className="animate-fade-up lg:col-span-5">
              {/* Cute Tilted Yellow Sticker Badge */}
              <div className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-white bg-[var(--color-sun-yellow-light)] px-4 py-1.5 text-xs font-extrabold text-[var(--color-sun-text)] shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-[var(--color-sun-amber)]" aria-hidden="true" />
                <span>{t.hero.badge}</span>
              </div>

              <h1 className="mt-5 font-heading text-3xl font-black tracking-tight text-white drop-shadow-sm sm:text-5xl sm:leading-[1.15]">
                {t.hero.titleLine1}{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[var(--color-sun-yellow-light)] via-[var(--color-peach)] to-[var(--color-accent-aqua)] bg-clip-text text-transparent">
                    {t.hero.titleHighlight}
                  </span>
                  {/* Cute hand-drawn style underline curve */}
                  <CurvedUnderline className="mt-0.5 h-3 w-full" />
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-[var(--color-bg-card-photo)]/95 sm:text-lg">
                {t.hero.subtitle}
              </p>

              {/* Cute Pastel Feature Pills */}
              <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-extrabold">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-border-alt)] bg-[var(--color-bg-soft)] px-3.5 py-2 text-[var(--color-brand-deep)] shadow-sm">
                  <MapPin className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
                  {t.hero.statCurated}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-mint-border-alt)] bg-[var(--color-mint-bg-alt)] px-3.5 py-2 text-[var(--color-mint-text-dark)] shadow-sm">
                  <Navigation className="h-3.5 w-3.5 text-[var(--color-mint-text-dark)]" aria-hidden="true" />
                  {t.hero.statFreeMap}
                </span>
              </div>
            </div>

            {/* Right Column: Visual Infographic Banner Subcomponent */}
            <HomeHeroInfographic locale={locale} />
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="mx-auto -mt-20 max-w-7xl space-y-7 px-4 sm:px-6 lg:px-8">
        <SearchFilterBar
          provinces={metadata.provinces}
          categories={metadata.categories}
          currentFilters={filters}
        />

        {/* Trip Results Area with Async Skeleton Loading Grid */}
        <div className="relative min-h-[300px]">
          {isLoading ? (
            <section aria-label="Searching routes">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-6 w-32 rounded-full bg-slate-200 animate-pulse" />
                  <div className="h-8 w-64 rounded-full bg-slate-200 animate-pulse" />
                </div>
                <div className="h-8 w-28 rounded-full bg-slate-200 animate-pulse" />
              </div>
              <TripCardSkeletonGrid count={6} />
            </section>
          ) : displayTrips.length === 0 ? (
            <div className="cute-card border-dashed p-12 text-center">
              <div className="mx-auto flex h-16 w-16 -rotate-6 items-center justify-center rounded-3xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-card-photo)] text-[var(--color-brand-primary)] shadow-sm">
                <Compass className="h-8 w-8" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-extrabold text-[var(--color-brand-deep)]">
                {t.search.emptyTitle}
              </h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm font-medium text-slate-600">
                {t.search.emptySubtitle}
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="cute-yellow-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {t.search.showAllBtn}
                </Link>
              </div>
            </div>
          ) : (
            <section aria-label="Curated trips list">
              {/* Cute Section Header with Pill Tag */}
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl font-black text-[var(--color-brand-deep)] sm:text-3xl">
                    {locale === "th"
                      ? "ทริปแนะนำพร้อมออกเดินทาง"
                      : "Curated Ready-to-Follow Trips"}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-600 sm:text-sm">
                    {locale === "th"
                      ? "เลือกทริปที่ถูกใจเพื่อดูลำดับจุดแวะบนแผนที่และกดนำทางได้เลย"
                      : "Select any itinerary to inspect ordered stops on the map and launch Google Maps"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-[var(--color-sun-yellow-light)] px-4 py-1.5 text-xs font-extrabold text-[var(--color-sun-text)] shadow-sm">
                  <MapPin className="h-3.5 w-3.5 text-[var(--color-sun-amber)]" aria-hidden="true" />
                  {t.search.showingPrefix} {displayTrips.length} {t.search.showingUnit}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {displayTrips.map((trip, index) => (
                  <TripCard key={trip.id} trip={trip} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
