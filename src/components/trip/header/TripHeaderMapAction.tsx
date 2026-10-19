"use client";

import React from "react";
import { Map, ArrowRight, Split, ExternalLink } from "lucide-react";
import type { TripGoogleMapsResult, RouteSegmentLink } from "@/lib/google-maps";
import type { useLanguage } from "@/components/LanguageProvider";

interface TripHeaderMapActionProps {
  googleMapsResult: TripGoogleMapsResult;
  stopsCount: number;
  modeLabel: string;
  locale: "th" | "en";
  t: ReturnType<typeof useLanguage>["t"];
}

export function TripHeaderMapAction({
  googleMapsResult,
  stopsCount,
  modeLabel,
  locale,
  t,
}: TripHeaderMapActionProps) {
  return (
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
                    ลิงก์พิกัดทั้ง {stopsCount} จุดตามลำดับเข้าแผนที่{" "}
                    <span className="underline decoration-[#158492]/60 underline-offset-2">
                      Google Maps ({modeLabel})
                    </span>{" "}
                    ได้เลย
                  </>
                ) : (
                  t.detail.readySubtitle(stopsCount, modeLabel)
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
  );
}

