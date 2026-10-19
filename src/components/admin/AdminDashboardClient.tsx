"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  LogOut,
  CheckCircle2,
  FileEdit,
  RotateCcw,
  Database,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { TripListItem, TripStatus } from "@/types/trip";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeTrip } from "@/lib/i18n-trips";

interface AdminDashboardClientProps {
  initialTrips: TripListItem[];
  adminEmail: string;
  backendName: string;
}

export function AdminDashboardClient({
  initialTrips,
  adminEmail,
  backendName,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [trips, setTrips] = useState<TripListItem[]>(initialTrips);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleToggleStatus(trip: TripListItem) {
    const nextStatus: TripStatus =
      trip.status === "published" ? "draft" : "published";
    setBusyId(trip.id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Failed to update trip status.",
        });
      } else {
        setTrips((prev) =>
          prev.map((item) =>
            item.id === trip.id ? { ...item, status: nextStatus } : item
          )
        );
        setFeedback({
          type: "success",
          message: `"${trip.title}" -> ${nextStatus.toUpperCase()}`,
        });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while updating status." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteTrip(trip: TripListItem) {
    const confirmed = window.confirm(
      `Delete trip "${trip.title}" and all ${trip.stop_count} stops?`
    );
    if (!confirmed) return;

    setBusyId(trip.id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/trips/${trip.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setFeedback({
          type: "error",
          message: data.error || "Failed to delete trip.",
        });
      } else {
        setTrips((prev) => prev.filter((item) => item.id !== trip.id));
        setFeedback({
          type: "success",
          message: `Deleted "${trip.title}".`,
        });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while deleting trip." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleResetSeed() {
    const confirmed = window.confirm(
      "Reset database to initial sample seed trips? Any custom trips or edits will be replaced."
    );
    if (!confirmed) return;

    setBusyId("seed");
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      if (!res.ok) {
        setFeedback({ type: "error", message: "Failed to reset sample seed data." });
      } else {
        const listRes = await fetch("/api/admin/trips");
        const listData = (await listRes.json()) as { trips?: TripListItem[] };
        if (listData.trips) {
          setTrips(listData.trips);
        }
        setFeedback({
          type: "success",
          message: "Sample seed data restored.",
        });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while resetting seed data." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const publishedCount = trips.filter((item) => item.status === "published").length;
  const draftCount = trips.length - publishedCount;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="cute-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span>
              {t.admin.signedInAs}{" "}
              <strong className="font-extrabold text-[var(--color-brand-deep)]">{adminEmail}</strong>
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-[var(--color-border-alt)] bg-[var(--color-bg-soft)] px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-[var(--color-brand-primary)]">
              <Database className="h-3 w-3" aria-hidden="true" />
              {backendName}
            </span>
          </div>
          <h1 className="mt-1.5 font-heading text-2xl font-black text-[var(--color-brand-deep)]">
            {t.admin.dashboardTitle}
          </h1>
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            {t.admin.dashboardSummary(trips.length, publishedCount, draftCount)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/trips/new"
            className="cute-yellow-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{t.admin.createNewTrip}</span>
          </Link>

          <button
            type="button"
            onClick={handleResetSeed}
            disabled={busyId === "seed"}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-3.5 py-2 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-sm transition hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)] disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
            <span>{t.admin.resetSampleData}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] px-3.5 py-2 text-xs font-extrabold text-[var(--color-coral-text-dark)] shadow-sm transition hover:bg-[var(--color-coral-border-alt)]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.admin.signOut}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border-2 p-4 text-xs font-extrabold ${
            feedback.type === "success"
              ? "border-[var(--color-mint-border-alt)] bg-[var(--color-mint-bg-alt)] text-[var(--color-mint-text-dark)]"
              : "border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] text-[var(--color-coral-text-dark)]"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Trips Table */}
      <div className="cute-card overflow-hidden">
        {trips.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-extrabold text-[var(--color-brand-deep)]">
              No trips in the database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] text-xs font-extrabold uppercase tracking-wider text-[var(--color-brand-primary)]">
                  <th className="px-5 py-3.5">{t.admin.colTitle}</th>
                  <th className="px-5 py-3.5">{t.admin.colProvince}</th>
                  <th className="px-5 py-3.5">{t.admin.colStops}</th>
                  <th className="px-5 py-3.5">{t.admin.colStatus}</th>
                  <th className="px-5 py-3.5 text-right">{t.admin.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]/60">
                {trips.map((rawTrip) => {
                  const trip = localizeTrip(rawTrip, locale);
                  return (
                    <tr
                      key={trip.id}
                      className="transition-colors hover:bg-[var(--color-bg-soft)]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading font-extrabold text-[var(--color-brand-deep)]">
                            {trip.title}
                          </span>
                          {trip.is_sample && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-sun-yellow)] bg-[var(--color-sun-cream)] px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--color-sun-text)]">
                              <Sparkles className="h-2.5 w-2.5 text-[var(--color-sun-amber)]" aria-hidden="true" />
                              {t.card.sampleBadge}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-slate-500">
                          /trips/{trip.slug}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <div className="font-extrabold text-[var(--color-brand-deep)]">
                          {trip.province}
                        </div>
                        <div className="font-medium text-slate-500">
                          {trip.category} &bull; {trip.duration_label}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full border-2 border-[var(--color-border-alt)] bg-[var(--color-bg-soft)] px-2.5 py-0.5 text-xs font-extrabold text-[var(--color-brand-primary)]">
                          <MapPin
                            className="h-3.5 w-3.5 text-[var(--color-brand-cyan)]"
                            aria-hidden="true"
                          />
                          {t.detail.statStopsUnit(trip.stop_count)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {trip.status === "published" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border-2 border-[var(--color-mint-border-alt)] bg-[var(--color-mint-bg-alt)] px-2.5 py-0.5 text-xs font-extrabold text-[var(--color-mint-text-dark)]">
                            <CheckCircle2
                              className="h-3.5 w-3.5 text-[var(--color-mint-text-dark)]"
                              aria-hidden="true"
                            />
                            {t.admin.statusPublished}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] px-2.5 py-0.5 text-xs font-extrabold text-[var(--color-coral-text-dark)]">
                            <FileEdit
                              className="h-3.5 w-3.5 text-[var(--color-coral-text-dark)]"
                              aria-hidden="true"
                            />
                            {t.admin.statusDraft}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <Link
                            href={`/trips/${trip.slug}?preview=1`}
                            className="inline-flex items-center gap-1 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-sm transition hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)]"
                          >
                            <Eye
                              className="h-3.5 w-3.5 text-[var(--color-brand-primary)]"
                              aria-hidden="true"
                            />
                            <span>{t.admin.previewBtn}</span>
                          </Link>

                          <Link
                            href={`/admin/trips/${trip.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[var(--color-brand-teal-darkest)]"
                          >
                            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t.admin.editStopsBtn}</span>
                          </Link>

                          <button
                            type="button"
                            disabled={busyId === trip.id}
                            onClick={() => handleToggleStatus(rawTrip)}
                            className="inline-flex items-center rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-sm transition hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)] disabled:opacity-50"
                          >
                            {trip.status === "published"
                              ? t.admin.unpublishBtn
                              : t.admin.publishBtn}
                          </button>

                          <button
                            type="button"
                            disabled={busyId === trip.id}
                            onClick={() => handleDeleteTrip(rawTrip)}
                            aria-label={`Delete ${trip.title}`}
                            className="inline-flex items-center rounded-full border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] p-1.5 text-[var(--color-coral-text-dark)] shadow-sm transition hover:bg-[var(--color-coral-border-alt)] disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
