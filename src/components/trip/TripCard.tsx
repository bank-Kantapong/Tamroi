"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Wallet,
  Compass,
  Footprints,
  Car,
  Train,
  Bike,
  ImageOff,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import type { TravelMode, TripListItem } from "@/types/trip";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeTrip } from "@/lib/i18n-trips";
import { dictionary, type Locale } from "@/lib/i18n";
import { SaveTripButton } from "@/components/trip/SaveTripButton";

export function formatBudgetRange(
  min: number | null,
  max: number | null,
  locale: Locale = "th"
): string {
  const t = dictionary[locale].card;
  if (min !== null && max !== null) {
    if (min === max) return `฿${min.toLocaleString()}`;
    return `฿${min.toLocaleString()} – ฿${max.toLocaleString()}`;
  }
  if (min !== null) return t.fromBudget(min.toLocaleString());
  if (max !== null) return t.upToBudget(max.toLocaleString());
  return t.flexibleBudget;
}

export function TravelModeBadge({ mode }: { mode: TravelMode }) {
  const { t } = useLanguage();
  if (!mode) return null;

  const icons: Record<string, typeof Car> = {
    driving: Car,
    walking: Footprints,
    transit: Train,
    bicycling: Bike,
    other: Compass,
  };
  const Icon = icons[mode] ?? Compass;
  const label =
    mode === "other"
      ? "อื่นๆ"
      : t.card.travelMode[mode as keyof typeof t.card.travelMode] ?? t.card.travelMode.driving;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-mint-border-alt)] bg-[var(--color-mint-bg-alt)] px-2.5 py-0.5 text-xs font-extrabold text-[var(--color-mint-text-dark)] shadow-sm">
      <Icon className="h-3.5 w-3.5 text-[var(--color-mint-text-dark)]" aria-hidden="true" />
      {label}
    </span>
  );
}

const BADGE_COLORS = [
  "bg-[var(--color-brand-cyan)]",
  "bg-[var(--color-sage-dark)]",
  "bg-[var(--color-sun-yellow)]",
  "bg-[var(--color-coral-accent)]",
];

export function TripCard({
  trip: rawTrip,
  index = 0,
}: {
  trip: TripListItem;
  index?: number;
}) {
  const { locale, t } = useLanguage();
  const trip = localizeTrip(rawTrip, locale);
  const [imageFailed, setImageFailed] = useState(false);
  const primaryCover = trip.cover_image_url
    ? trip.cover_image_url.split(/[\n,]/)[0].trim()
    : null;
  const showImage = Boolean(primaryCover) && !imageFailed;
  const numberBadgeColor = BADGE_COLORS[index % BADGE_COLORS.length];

  return (
    <article
      style={{ animationDelay: `${Math.min(index * 70, 280)}ms` }}
      className="cute-card card-interactive animate-fade-up group flex flex-col overflow-hidden p-2.5 transition-all hover:border-[var(--color-accent-aqua)] text-xs"
    >
      {/* Cute Scrapbook Photo Frame */}
      <Link
        href={`/trips/${trip.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-card-photo)]"
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryCover!}
            alt={trip.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--color-bg-aqua-fade)] via-[var(--color-mint-bg-alt)] to-[var(--color-sun-lightest)] p-3 text-center text-[var(--color-brand-deep)]">
            <ImageOff className="mb-1 h-6 w-6 text-[var(--color-brand-primary)]/60" aria-hidden="true" />
            <span className="text-[11px] font-bold">{t.card.noCover}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-brand-deep)]/75 to-transparent" />

        {/* Top-left Number Circle + Province & Category Pills */}
        <div className="absolute left-2 top-2 flex flex-wrap items-center gap-1">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white font-heading text-[11px] font-black text-white shadow-md ${numberBadgeColor}`}
          >
            {index + 1}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/40 bg-[var(--color-brand-primary)]/95 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm backdrop-blur-md">
            {trip.province}
          </span>
          <span className="inline-flex items-center rounded-full border border-[var(--color-border-subtle)] bg-white/95 px-2 py-0.5 text-[11px] font-extrabold text-[var(--color-brand-primary)] shadow-sm backdrop-blur-md">
            {trip.category}
          </span>
        </div>

        {/* Top-right Save Bookmark Button */}
        <div className="absolute right-2 top-2 z-10">
          <SaveTripButton tripId={trip.id} variant="card" />
        </div>

        {/* Sample Sticker Badge */}
        {trip.is_sample && (
          <span className="absolute bottom-2 right-2 inline-flex -rotate-2 items-center gap-1 rounded-full border-2 border-white bg-[var(--color-sun-yellow-light)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-sun-text)] shadow-md">
            <Sparkles className="h-2.5 w-2.5 text-[var(--color-sun-amber)]" aria-hidden="true" />
            {t.card.sampleBadge}
          </span>
        )}
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between px-1 pt-3">
        <div>
          {/* Mini Route Dots + Stops Count & Travel Mode */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-alt)] bg-[var(--color-bg-soft)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--color-brand-primary)]">
              <MapPin className="h-3 w-3 text-[var(--color-brand-cyan)]" aria-hidden="true" />
              {t.card.stopsCount(trip.stop_count)}
            </span>
            <TravelModeBadge mode={trip.travel_mode} />
          </div>

          <h2 className="mt-2 font-heading text-base font-extrabold leading-snug text-[var(--color-brand-deep)] transition-colors group-hover:text-[var(--color-brand-primary)]">
            <Link href={`/trips/${trip.slug}`} className="focus:underline line-clamp-1">
              {trip.title}
            </Link>
          </h2>

          <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-slate-600">
            {trip.short_description}
          </p>
        </div>

        {/* Cute Pastel Info Boxes (Duration & Budget) */}
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border-alt)] bg-[var(--color-bg-soft)] p-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-aqua-fade)] text-[var(--color-brand-primary)]">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <dt className="text-[9px] font-bold text-[var(--color-brand-primary)]/80">
                {t.card.duration}
              </dt>
              <dd className="truncate text-[11px] font-heading font-extrabold text-[var(--color-brand-deep)]">
                {trip.duration_label}
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] p-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--color-coral-border-alt)] text-[var(--color-coral-text-dark)]">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <dt className="text-[9px] font-bold text-[var(--color-coral-text-dark)]/80">
                {t.card.budget}
              </dt>
              <dd className="truncate text-[11px] font-heading font-extrabold text-[var(--color-brand-deep)]">
                {formatBudgetRange(trip.budget_min, trip.budget_max, locale)}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Cute Dashed Route Divider + Action Button */}
      <div className="mt-2.5 border-t border-dashed border-[var(--color-border-subtle)] px-1 pb-0.5 pt-2">
        <Link
          href={`/trips/${trip.slug}`}
          className="cute-aqua-btn inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold"
        >
          <Compass className="h-3.5 w-3.5 text-[var(--color-sun-yellow-light)]" aria-hidden="true" />
          <span>
            {trip.stop_count === 0
              ? locale === "th"
                ? "อ่านรีวิว & ดูรูปภาพ"
                : "Read Review & Photos"
              : t.card.viewRouteBtn}
          </span>
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
