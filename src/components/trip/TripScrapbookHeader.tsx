"use client";

import {
  MapPin,
  Clock,
  Camera,
  Star,
  Utensils,
  Car,
  Map,
  ArrowRight,
  ExternalLink,
  Split,
  Image as ImageIcon,
} from "lucide-react";
import type { TripStop, TripWithStops } from "@/types/trip";
import type { TripGoogleMapsResult, RouteSegmentLink } from "@/lib/google-maps";
import { formatBudgetRange } from "./TripCard";
import type { useLanguage } from "@/components/LanguageProvider";
import {
  PaperPlaneDoodle,
  ScrapbookPhotoUnderline,
  CurvedArrowPhoto,
  ScrapbookCurveCyan,
  RisingSunDoodle,
} from "@/components/illustrations";

interface TripScrapbookHeaderProps {
  trip: TripWithStops;
  orderedStops: TripStop[];
  totalPhotos: number;
  totalStopCost: number;
  totalEstimatedMinutes: number;
  googleMapsResult: TripGoogleMapsResult;
  modeLabel: string;
  coverFailed: boolean;
  onCoverError: () => void;
  locale: "th" | "en";
  t: ReturnType<typeof useLanguage>["t"];
}

export function TripScrapbookHeader({
  trip,
  orderedStops,
  totalPhotos,
  totalStopCost,
  totalEstimatedMinutes,
  googleMapsResult,
  modeLabel,
  coverFailed,
  onCoverError,
  locale,
  t,
}: TripScrapbookHeaderProps) {
  return (
    <div className="animate-fade-up relative scrapbook-header-card">
      {/* Top-right Paper Plane + Looping Dashed Trail SVG */}
      <PaperPlaneDoodle className="pointer-events-none absolute -top-3 right-3 hidden h-20 w-40 select-none sm:block" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {/* Left Column: Large Rounded Cover Photo with Overlays */}
        <div className="scrapbook-photo-frame aspect-[4/3] min-h-[300px] sm:aspect-[16/10] lg:col-span-5 lg:aspect-auto">
          {trip.cover_image_url && !coverFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trip.cover_image_url}
              alt={trip.title}
              className="h-full w-full object-cover"
              onError={onCoverError}
            />
          ) : (
            <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--color-bg-aqua-fade)] via-[var(--color-mint-bg-alt)] to-[var(--color-sun-lightest)] p-6 text-center text-[var(--color-brand-deep)]">
              <ImageIcon className="mb-2 h-10 w-10 text-[var(--color-brand-primary)]/60" aria-hidden="true" />
              <span className="text-xs font-bold">{t.card.noCover}</span>
            </div>
          )}

          {/* Subtle top/bottom vignette so badges and handwritten text stay legible */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />

          {/* Top-left Location Pill */}
          <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-[var(--color-brand-teal-dark)]/85 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md backdrop-blur-md">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[var(--color-brand-teal-dark)]">
              <MapPin className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
            </span>
            <span>{trip.province}</span>
          </span>

          {/* Handwritten Scrapbook Overlay Text on Photo */}
          <div className="pointer-events-none absolute inset-x-5 top-16 select-none">
            <div className="-rotate-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5">
                <span className="text-lg font-black text-[var(--color-sun-yellow-bright)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
                  =
                </span>
                <span className="font-heading text-2xl font-black tracking-wide text-white drop-shadow-[0_3px_6px_rgba(7,59,64,0.65)] sm:text-3xl">
                  {trip.province}
                </span>
                <span className="text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
                  =
                </span>
              </div>

              <div className="mt-0.5 pl-4 font-heading text-2xl font-black text-white drop-shadow-[0_3px_6px_rgba(7,59,64,0.65)] sm:text-3xl">
                {locale === "th" ? "สวยครบ" : "Highlights"}
                <span className="ml-1.5 text-lg text-[var(--color-sun-yellow-bright)]">✦</span>
              </div>

              <div className="mt-0.5 pl-8 font-heading text-xl font-black text-[var(--color-sun-yellow-light)] drop-shadow-[0_3px_6px_rgba(7,59,64,0.7)] sm:text-2xl">
                {locale === "th"
                  ? `จบใน ${trip.duration_label.split("(")[0].trim()}`
                  : trip.duration_label}{" "}
                <span className="text-white">♡</span>
              </div>

              <ScrapbookPhotoUnderline className="ml-8 mt-0.5 h-3 w-36" />
            </div>

            <div className="mt-1 flex flex-col items-end pr-2">
              <span className="-rotate-6 font-heading text-xs font-black text-[var(--color-brand-deep)] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] sm:text-sm">
                One day
              </span>
              <span className="-rotate-6 font-heading text-xs font-black text-[var(--color-brand-deep)] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] sm:text-sm">
                Trip ♡
              </span>
              <CurvedArrowPhoto className="mr-1 mt-0.5 h-7 w-11 text-[var(--color-brand-deep)] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]" />
            </div>
          </div>

          {/* Bottom-left Photo Count Badge */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2.5 rounded-2xl border border-white/25 bg-[var(--color-brand-deep)]/75 px-3.5 py-2 text-white shadow-lg backdrop-blur-md">
            <Camera className="h-5 w-5 text-white/90" aria-hidden="true" />
            <div className="leading-tight">
              <span className="block text-[10px] font-bold text-white/85">
                {locale === "th" ? "ภาพรวมทริป" : "Trip Gallery"}
              </span>
              <span className="block text-xs font-black text-white">
                {locale === "th" ? `${totalPhotos} รูป` : `${totalPhotos} Photos`}
              </span>
            </div>
          </div>

          {/* Bottom-center Pagination Dots */}
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/60 shadow-sm" />
            <span className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-white/60 shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-white/60 shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-white/60 shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-white/60 shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-white/60 shadow-sm" />
          </div>
        </div>

        {/* Right Column: Tags, Title, Description, 4 Pastel Cards & Google Maps Action */}
        <div className="flex flex-col justify-between p-1 sm:p-2 lg:p-3 lg:col-span-7">
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-tag-bg)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand-tag)]">
                <Star className="h-3.5 w-3.5 text-[var(--color-brand-tag)]" aria-hidden="true" />
                <span>{locale === "th" ? "เที่ยวไหนดี" : "Featured"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-tag-bg)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand-tag)]">
                <Utensils className="h-3.5 w-3.5 text-[var(--color-brand-tag)]" aria-hidden="true" />
                <span>{trip.category}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mint-bg)] px-3 py-1 text-xs font-extrabold text-[var(--color-mint-text-dark)]">
                <Car className="h-3.5 w-3.5 text-[var(--color-mint-text-dark)]" aria-hidden="true" />
                <span>{modeLabel}</span>
              </span>
            </div>

            {/* Floating Tilted Handwritten Note on the Right */}
            <div className="pointer-events-none float-right ml-3 mt-2 hidden -rotate-12 select-none text-center text-[var(--color-brand-teal-light)] xl:block">
              <span className="block font-heading text-sm font-black leading-tight">
                {locale === "th" ? "เก็บครบ" : "Explore"}
              </span>
              <span className="block font-heading text-sm font-black leading-tight">
                {locale === "th" ? "ทุกมุมสวย" : "Every Spot"}
              </span>
              <span className="block font-heading text-sm font-black leading-tight">
                {locale === "th" ? `ของ${trip.province} ♡` : `in ${trip.province} ♡`}
              </span>
              <ScrapbookCurveCyan className="mx-auto mt-0.5 h-2.5 w-20" />
            </div>

            <h1 className="mt-3.5 font-heading text-2xl font-black leading-snug tracking-tight text-[var(--color-brand-deep)] sm:text-[28px]">
              {trip.title}
            </h1>

            <p className="mt-2.5 text-sm font-extrabold leading-relaxed text-[var(--color-brand-tag)] sm:text-[15px]">
              {trip.short_description}
            </p>

            <div className="mt-3 text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
              <p className="whitespace-pre-line">{trip.description}</p>
              {locale === "th" && (
                <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 font-semibold text-slate-600">
                  <span>
                    เดินทางง่าย ใช้เวลาไม่มาก ใครมีวันหยุดสั้นๆ ก็เที่ยวตามได้เลย ♡
                  </span>
                  <RisingSunDoodle className="inline-block h-5 w-6 text-[var(--color-brand-teal-light)]" />
                </p>
              )}
            </div>
          </div>

          {/* 4 Pastel Stat Cards & Google Maps Action Box */}
          <div className="mt-5">
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

            {/* Bottom Action Box */}
            <div className="mt-4 action-box-maps">
              {!googleMapsResult.hasValidRoute ? (
                <p className="text-xs font-bold text-slate-600">
                  {googleMapsResult.reason}
                </p>
              ) : !googleMapsResult.isSegmented ? (
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)] text-white shadow-sm">
                      <Map className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-heading text-sm font-black text-[var(--color-brand-deep)] sm:text-base">
                        {locale === "th"
                          ? "พร้อมออกเดินทางตามรอยหรือยัง?"
                          : t.detail.readyTitle}
                      </h2>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">
                        {locale === "th" ? (
                          <>
                            ลิงก์พิกัดทั้ง {orderedStops.length} จุดตามลำดับเข้าแผนที่{" "}
                            <span className="underline decoration-[#158492]/60 underline-offset-2">
                              Google Maps ({modeLabel})
                            </span>{" "}
                            ได้เลย
                          </>
                        ) : (
                          t.detail.readySubtitle(orderedStops.length, modeLabel)
                        )}
                      </p>
                    </div>
                  </div>
                  <a
                    href={googleMapsResult.primaryUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-open-maps-gold"
                  >
                    <Map className="h-4 w-4 text-[var(--color-sun-text-dark)]" aria-hidden="true" />
                    <span>
                      {locale === "th"
                        ? "เปิดดูทริปใน Google Maps"
                        : t.detail.openFullGoogleMaps}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[var(--color-sun-text-dark)]" aria-hidden="true" />
                  </a>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)] text-white shadow-sm">
                      <Split className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-heading text-sm font-extrabold text-[var(--color-brand-deep)]">
                        {t.detail.segmentedTitle(googleMapsResult.segments.length)}
                      </h2>
                      <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-600">
                        {t.detail.segmentedDesc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {googleMapsResult.segments.map((seg: RouteSegmentLink) => (
                      <a
                        key={seg.segmentIndex}
                        href={seg.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-interactive flex items-center justify-between rounded-2xl border-2 border-[var(--color-border-subtle)] bg-white px-4 py-3 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-sm hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-sun-cream)]"
                      >
                        <div>
                          <span className="block font-heading font-black text-[var(--color-brand-primary)]">
                            {t.detail.segmentPartLabel(
                              seg.segmentIndex,
                              seg.fromStopNumber,
                              seg.toStopNumber
                            )}
                          </span>
                          <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                            {seg.fromPlaceName} &rarr; {seg.toPlaceName}
                          </span>
                        </div>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-sun-yellow-light)] text-[var(--color-sun-text)]">
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
