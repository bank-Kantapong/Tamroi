"use client";

import React from "react";
import { Clock, MapPin, Star } from "lucide-react";
import type { TripStop, TripWithStops } from "@/types/trip";
import type { useLanguage } from "@/components/LanguageProvider";
import { formatBudgetRange } from "../TripCard";

interface TripHeaderStatsProps {
  trip: TripWithStops;
  orderedStops: TripStop[];
  totalStopCost: number;
  totalEstimatedMinutes: number;
  locale: "th" | "en";
  t: ReturnType<typeof useLanguage>["t"];
}

export function TripHeaderStats({
  trip,
  orderedStops,
  totalStopCost,
  totalEstimatedMinutes,
  locale,
  t,
}: TripHeaderStatsProps) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="stat-card-duration">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)] text-white">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <dt className="text-xs font-extrabold text-[var(--color-brand-teal-light)]">
            {locale === "th" ? "เวลาทั้งทริป" : t.detail.statDuration}
          </dt>
        </div>
        <dd className="mt-2 font-heading text-base font-black text-[var(--color-brand-deep)] sm:text-lg">
          {trip.duration_label}
        </dd>
      </div>

      <div className="stat-card-budget">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-mint-icon)] text-white">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <dt className="text-xs font-extrabold text-[var(--color-mint-text)]">
            {locale === "th" ? "งบประมาณทริป" : t.detail.statBudget}
          </dt>
        </div>
        <dd className="mt-2 font-heading text-base font-black text-[var(--color-brand-deep)] sm:text-lg">
          {formatBudgetRange(trip.budget_min, trip.budget_max, locale)}
          <span className="mt-0.5 block font-sans text-xs font-semibold text-slate-500">
            {locale === "th" ? "(ต่อคน)" : "(per person)"}
          </span>
        </dd>
      </div>

      <div className="stat-card-stops">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-amber-icon)] text-white">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <dt className="text-xs font-extrabold text-[var(--color-amber-text)]">
            {locale === "th" ? "จุดแวะทั้งหมด" : t.detail.statStops}
          </dt>
        </div>
        <dd className="mt-2 font-heading text-base font-black text-[var(--color-brand-deep)] sm:text-lg">
          {t.detail.statStopsUnit(orderedStops.length)}
        </dd>
      </div>

      <div className="stat-card-cost">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-coral-icon)] text-white">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <dt className="text-xs font-extrabold text-[var(--color-coral-text)]">
            {locale === "th" ? "รวมค่าใช้จ่ายจุดแวะ" : t.detail.statStopCost}
          </dt>
        </div>
        <dd className="mt-2 font-heading text-base font-black text-[var(--color-brand-deep)] sm:text-lg">
          {totalStopCost > 0
            ? `~฿${totalStopCost.toLocaleString()}`
            : t.detail.statFreeOrVaries}
          {orderedStops.length > 0 && totalEstimatedMinutes > 0 && (
            <span className="mt-0.5 block font-sans text-[11px] font-semibold text-slate-500">
              {locale === "th"
                ? `(เฉลี่ยต่อจุด ~${Math.round((totalEstimatedMinutes / 60) * 10) / 10} ชม.)`
                : `(total ~${Math.round((totalEstimatedMinutes / 60) * 10) / 10} hrs)`}
            </span>
          )}
        </dd>
      </div>
    </dl>
  );
}

