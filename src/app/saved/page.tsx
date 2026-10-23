"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Compass, FolderHeart, ArrowLeft, LogIn } from "lucide-react";
import type { TripListItem } from "@/types/trip";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { TripCard } from "@/components/trip/TripCard";
import { TripCardSkeletonGrid } from "@/components/skeleton";

export default function SavedTripsPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [savedTrips, setSavedTrips] = useState<TripListItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function loadSavedTrips() {
      if (!user) {
        setFetching(false);
        return;
      }
      try {
        const res = await fetch("/api/saved", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSavedTrips(data.savedTrips || []);
        }
      } catch (err) {
        console.error("Failed to fetch saved trips:", err);
      } finally {
        setFetching(false);
      }
    }

    if (!loading) {
      loadSavedTrips();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="cute-page-container py-8 sm:py-12 space-y-8">
        <div className="space-y-2">
          <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-8 w-48 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <TripCardSkeletonGrid count={3} />
      </div>
    );
  }

  // Logged-out visitor state
  if (!user) {
    return (
      <div className="cute-page-container py-10 sm:py-16">
        <div className="mx-auto max-w-md text-center cute-card p-8 sm:p-10">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-white bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-accent-aqua)] text-white shadow-lg">
            <Bookmark className="h-8 w-8 fill-current" />
          </span>
          <h1 className="font-heading text-2xl font-black text-[var(--color-brand-deep)]">
            {t.saved.title}
          </h1>
          <p className="mt-2 text-xs font-medium text-slate-600 leading-relaxed">
            {t.saved.subtitle}
          </p>
          <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900">
            {t.saved.loginToSave}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row justify-center">
            <Link
              href="/login?returnTo=/saved"
              className="cute-btn cute-btn-primary inline-flex items-center justify-center gap-2 py-2.5 px-6 text-xs font-black"
            >
              <LogIn className="h-4 w-4" />
              <span>{t.nav.login}</span>
            </Link>
            <Link
              href="/"
              className="cute-btn cute-btn-secondary inline-flex items-center justify-center gap-2 py-2.5 px-6 text-xs font-black"
            >
              <Compass className="h-4 w-4" />
              <span>{t.saved.browseTrips}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cute-page-container py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[var(--color-brand-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.detail.backHome}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white bg-[var(--color-brand-primary)] text-white shadow-sm">
              <FolderHeart className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-black text-[var(--color-brand-deep)]">
                {t.saved.title}
              </h1>
              <p className="text-xs font-medium text-slate-600">
                {t.saved.subtitle}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="cute-btn cute-btn-secondary inline-flex items-center gap-2 self-start py-2 px-4 text-xs font-bold"
        >
          <Compass className="h-4 w-4 text-[var(--color-brand-primary)]" />
          <span>{t.saved.browseTrips}</span>
        </Link>
      </div>

      {fetching ? (
        <TripCardSkeletonGrid count={3} />
      ) : savedTrips.length === 0 ? (
        <div className="cute-card py-16 px-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] text-[var(--color-brand-primary)]">
            <Bookmark className="h-7 w-7 text-slate-400" />
          </span>
          <h2 className="font-heading text-xl font-black text-[var(--color-brand-deep)]">
            {t.saved.emptyTitle}
          </h2>
          <p className="mt-2 text-xs font-medium text-slate-600 max-w-md mx-auto">
            {t.saved.emptySubtitle}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="cute-btn cute-btn-primary inline-flex items-center gap-2 py-2.5 px-6 text-xs font-black"
            >
              <Compass className="h-4 w-4" />
              <span>{t.saved.browseTrips}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {savedTrips.map((trip, idx) => (
            <TripCard key={trip.id} trip={trip} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
