"use client";

import { Wallet, Navigation } from "lucide-react";
import type { TravelMode, TripStop } from "@/types/trip";
import { buildStopNavigationUrl } from "@/lib/google-maps";
import type { useLanguage } from "@/components/LanguageProvider";

interface TripStopListItemProps {
  stop: TripStop;
  index: number;
  isSelected: boolean;
  badgeColorClass: string;
  travelMode: TravelMode;
  onSelectStop: (id: string, panMap: boolean) => void;
  t: ReturnType<typeof useLanguage>["t"];
}

export function TripStopListItem({
  stop,
  isSelected,
  badgeColorClass,
  travelMode,
  onSelectStop,
  t,
}: TripStopListItemProps) {
  return (
    <li
      id={`stop-item-${stop.id}`}
      className={`rounded-3xl border-2 transition-all duration-200 ${
        isSelected
          ? "border-[var(--color-brand-primary)] bg-gradient-to-r from-[var(--color-bg-card-photo)] via-white to-[var(--color-sun-cream)] shadow-[0_6px_0_rgba(9,124,135,0.16)]"
          : "border-[var(--color-border-subtle)] bg-white shadow-[0_4px_0_rgba(9,124,135,0.07)] hover:border-[var(--color-accent-aqua)]"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3.5">
          <button
            type="button"
            onClick={() => onSelectStop(stop.id, false)}
            aria-pressed={isSelected}
            aria-label={`${stop.sequence}. ${stop.place_name}`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white font-heading text-sm font-black text-white shadow-md transition-transform duration-200 ${
              isSelected
                ? "scale-110 ring-4 ring-[var(--color-sun-yellow-light)]"
                : "hover:scale-105"
            } ${badgeColorClass}`}
          >
            {stop.sequence}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => onSelectStop(stop.id, false)}
                className="text-left font-heading text-base font-extrabold text-[var(--color-brand-deep)] hover:text-[var(--color-brand-primary)] focus:underline"
              >
                {stop.place_name}
              </button>
            </div>

            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
              {stop.description}
            </p>

            {stop.estimated_cost !== null && (
              <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-[var(--color-coral-text-dark)]">
                <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {stop.estimated_cost === 0
                    ? t.detail.freeCost
                    : `฿${stop.estimated_cost.toLocaleString()}`}
                </span>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-[var(--color-border-subtle)] pt-2.5">
              <button
                type="button"
                onClick={() => onSelectStop(stop.id, false)}
                className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-extrabold transition ${
                  isSelected
                    ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
                    : "bg-[var(--color-bg-card-photo)] text-[var(--color-brand-primary)] hover:bg-[var(--color-bg-aqua-fade)]"
                }`}
              >
                {isSelected
                  ? t.detail.selectedOnMapBtn
                  : t.detail.showOnMapBtn}
              </button>

              <a
                href={buildStopNavigationUrl(stop, travelMode)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[var(--color-sun-yellow-light)] px-3 text-xs font-extrabold text-[var(--color-sun-text)] shadow-sm transition hover:bg-[var(--color-sun-yellow)]"
              >
                <Navigation className="h-3 w-3" aria-hidden="true" />
                <span>{t.detail.googleMapsShort}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
