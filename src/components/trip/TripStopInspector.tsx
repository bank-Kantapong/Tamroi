"use client";

import {
  ImageOff,
  Info,
  Navigation,
  Check,
  Copy,
} from "lucide-react";
import type { TravelMode, TripStop } from "@/types/trip";
import { formatCoordinatePair, buildStopNavigationUrl } from "@/lib/google-maps";
import type { useLanguage } from "@/components/LanguageProvider";

interface TripStopInspectorProps {
  selectedStop: TripStop;
  orderedStops: TripStop[];
  travelMode: TravelMode;
  failedStopImages: Record<string, boolean>;
  onImageError: (stopId: string) => void;
  onSelectStop: (stopId: string) => void;
  onCopyCoordinates: (stop: TripStop) => void;
  copiedStopId: string | null;
  copyErrorStopId: string | null;
  t: ReturnType<typeof useLanguage>["t"];
}

export function TripStopInspector({
  selectedStop,
  orderedStops,
  travelMode,
  failedStopImages,
  onImageError,
  onSelectStop,
  onCopyCoordinates,
  copiedStopId,
  copyErrorStopId,
  t,
}: TripStopInspectorProps) {
  return (
    <div
      aria-labelledby="selected-stop-heading"
      aria-live="polite"
      className="cute-card animate-fade-up overflow-hidden border-[var(--color-brand-primary)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[var(--color-brand-primary)] via-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] px-5 py-3.5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[var(--color-sun-yellow)] font-heading text-sm font-black text-[var(--color-sun-text)] shadow-md">
            {selectedStop.sequence}
          </span>
          <div>
            <span className="text-[11px] font-extrabold text-[var(--color-sun-yellow-light)]">
              {t.detail.selectedStopBadge(selectedStop.sequence, orderedStops.length)}
            </span>
            <h3
              id="selected-stop-heading"
              className="font-heading text-base font-extrabold sm:text-lg"
            >
              {selectedStop.place_name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={selectedStop.sequence <= 1}
            onClick={() => {
              const prev = orderedStops.find(
                (s) => s.sequence === selectedStop.sequence - 1
              );
              if (prev) onSelectStop(prev.id);
            }}
            className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-white/30 disabled:opacity-40"
          >
            &larr; {t.detail.prevStop}
          </button>
          <button
            type="button"
            disabled={selectedStop.sequence >= orderedStops.length}
            onClick={() => {
              const next = orderedStops.find(
                (s) => s.sequence === selectedStop.sequence + 1
              );
              if (next) onSelectStop(next.id);
            }}
            className="rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-white/30 disabled:opacity-40"
          >
            {t.detail.nextStop} &rarr;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-12">
        <div className="sm:col-span-5">
          {selectedStop.image_url && !failedStopImages[selectedStop.id] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedStop.image_url}
              alt={selectedStop.place_name}
              className="aspect-[4/3] w-full rounded-2xl border-2 border-[var(--color-border-subtle)] object-cover shadow-sm"
              onError={() => onImageError(selectedStop.id)}
            />
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border-2 border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--color-bg-aqua-fade)] via-[var(--color-mint-bg-alt)] to-[var(--color-sun-lightest)] p-4 text-center text-[var(--color-brand-deep)]">
              <ImageOff
                className="mb-1.5 h-7 w-7 text-[var(--color-brand-primary)]/60"
                aria-hidden="true"
              />
              <span className="text-xs font-bold">{t.detail.noStopPhoto}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between sm:col-span-7">
          <div>
            <p className="text-sm font-medium leading-relaxed text-[var(--color-brand-deep)]">
              {selectedStop.description}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-2xl border-2 border-[var(--color-border-alt)] bg-[var(--color-bg-soft)] p-2.5">
                <dt className="font-bold text-[var(--color-brand-primary)]">
                  {t.detail.suggestedArrival}
                </dt>
                <dd className="mt-0.5 font-heading font-black text-[var(--color-brand-deep)]">
                  {selectedStop.suggested_arrival_time || t.detail.flexible}
                </dd>
              </div>
              <div className="rounded-2xl border-2 border-[var(--color-mint-border-alt)] bg-[var(--color-mint-bg-alt)] p-2.5">
                <dt className="font-bold text-[var(--color-mint-text-dark)]">
                  {t.detail.suggestedDuration}
                </dt>
                <dd className="mt-0.5 font-heading font-black text-[var(--color-brand-deep)]">
                  {selectedStop.estimated_minutes !== null
                    ? t.detail.minutesUnit(selectedStop.estimated_minutes)
                    : t.detail.flexible}
                </dd>
              </div>
              <div className="rounded-2xl border-2 border-[var(--color-sun-yellow)]/60 bg-[var(--color-sun-cream)] p-2.5">
                <dt className="font-bold text-[var(--color-amber-text)]">
                  {t.detail.estimatedCost}
                </dt>
                <dd className="mt-0.5 font-heading font-black text-[var(--color-brand-deep)]">
                  {selectedStop.estimated_cost !== null
                    ? selectedStop.estimated_cost === 0
                      ? t.detail.freeCost
                      : `฿${selectedStop.estimated_cost.toLocaleString()}`
                    : t.detail.notSpecified}
                </dd>
              </div>
              <div className="rounded-2xl border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] p-2.5">
                <dt className="font-bold text-[var(--color-coral-text-dark)]">
                  {t.detail.coordinates}
                </dt>
                <dd className="mt-0.5 font-mono text-[11px] font-extrabold text-[var(--color-brand-deep)]">
                  {formatCoordinatePair(
                    selectedStop.latitude,
                    selectedStop.longitude,
                    5
                  )}
                </dd>
              </div>
            </dl>

            {selectedStop.notes && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border-2 border-[var(--color-sun-yellow)] bg-[var(--color-sun-cream)] p-3 text-xs font-medium text-[var(--color-sun-text)]">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-sun-amber)]"
                  aria-hidden="true"
                />
                <span>{selectedStop.notes}</span>
              </div>
            )}
          </div>

          {/* Per-stop actions: Navigate & Copy coordinates */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t-2 border-dashed border-[var(--color-border-subtle)] pt-3.5">
            <a
              href={buildStopNavigationUrl(selectedStop, travelMode)}
              target="_blank"
              rel="noopener noreferrer"
              className="cute-yellow-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold"
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.detail.navigateStopBtn}</span>
            </a>

            <button
              type="button"
              onClick={() => onCopyCoordinates(selectedStop)}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-4 py-2 text-xs font-extrabold text-[var(--color-brand-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)]"
            >
              {copiedStopId === selectedStop.id ? (
                <>
                  <Check
                    className="h-3.5 w-3.5 text-[var(--color-brand-primary)]"
                    aria-hidden="true"
                  />
                  <span className="font-extrabold text-[var(--color-brand-primary)]">
                    {t.detail.copiedCoordsBtn(
                      formatCoordinatePair(
                        selectedStop.latitude,
                        selectedStop.longitude,
                        4
                      )
                    )}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
                  <span>{t.detail.copyCoordsBtn}</span>
                </>
              )}
            </button>

            {copyErrorStopId === selectedStop.id && (
              <span role="alert" className="text-xs font-bold text-red-600">
                {t.detail.copyErrorMsg}{" "}
                {formatCoordinatePair(selectedStop.latitude, selectedStop.longitude, 6)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
