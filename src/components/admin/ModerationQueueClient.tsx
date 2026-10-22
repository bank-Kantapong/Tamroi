"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import type { TripListItem, TripWithStops } from "@/types/trip";
import { useLanguage } from "@/components/LanguageProvider";

interface ModerationQueueClientProps {
  initialPending: TripListItem[];
  adminEmail: string;
  backendName: string;
}

export function ModerationQueueClient({
  initialPending,
  adminEmail,
  backendName,
}: ModerationQueueClientProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const [pending, setPending] = useState<TripListItem[]>(initialPending);
  const [selectedTrip, setSelectedTrip] = useState<TripWithStops | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [rejectingTripId, setRejectingTripId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setPending(initialPending);
  }, [initialPending]);

  async function handleInspect(tripId: string) {
    setInspectLoading(true);
    try {
      const res = await fetch(`/api/admin/moderation/${tripId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTrip(data.trip);
      }
    } catch (err) {
      console.error("Inspect error:", err);
    } finally {
      setInspectLoading(false);
    }
  }

  async function handleApprove(tripId: string) {
    const confirmed = window.confirm(t.moderation.confirmApprove);
    if (!confirmed) return;

    setActionBusyId(tripId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/moderation/${tripId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to approve." });
      } else {
        setPending((prev) => prev.filter((p) => p.id !== tripId));
        setSelectedTrip(null);
        setFeedback({
          type: "success",
          message: data.message || "Trip approved and published successfully!",
        });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error occurred." });
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectingTripId) return;
    if (rejectionReason.trim().length < 3) {
      alert("Please provide a reason of at least 3 characters.");
      return;
    }

    setActionBusyId(rejectingTripId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/moderation/${rejectingTripId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejection_reason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to reject." });
      } else {
        setPending((prev) => prev.filter((p) => p.id !== rejectingTripId));
        setRejectingTripId(null);
        setRejectionReason("");
        setSelectedTrip(null);
        setFeedback({
          type: "success",
          message: data.message || "Submission marked as rejected with feedback.",
        });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", message: "Network error occurred." });
    } finally {
      setActionBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cute-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[var(--color-brand-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับไปจัดการทริปทั้งหมด (All Trips)</span>
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-1">
            <span>Admin: <strong className="text-slate-700">{adminEmail}</strong></span>
            <span>•</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-full">{backendName}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-black text-[var(--color-brand-deep)]">
              {t.moderation.title}
            </h1>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 border border-amber-300">
              {t.moderation.pendingBadge(pending.length)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{t.moderation.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="cute-btn cute-btn-secondary text-xs py-2 px-4 font-bold"
          >
            {t.nav.admin}
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-2xl border-2 p-4 text-xs font-bold ${
            feedback.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-rose-300 bg-rose-50 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Pending Submissions List */}
      {pending.length === 0 ? (
        <div className="cute-card py-16 px-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h2 className="font-heading text-xl font-black text-[var(--color-brand-deep)]">
            {t.moderation.emptyTitle}
          </h2>
          <p className="mt-2 text-xs font-medium text-slate-500 max-w-md mx-auto">
            {t.moderation.emptySubtitle}
          </p>
          <div className="mt-6">
            <Link
              href="/admin"
              className="cute-btn cute-btn-primary inline-flex items-center gap-2 py-2 px-5 text-xs font-bold"
            >
              <span>ดูทริปทั้งหมดในระบบ</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <div
              key={item.id}
              className="cute-card p-5 sm:p-6 transition hover:border-[var(--color-brand-primary)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-0.5 text-xs font-black text-sky-800">
                    <Clock className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
                    <span>Pending Review</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {item.province}
                  </span>
                  <span className="text-xs text-slate-500">
                    {item.stop_count} จุดแวะ
                  </span>
                  {item.submitted_at && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.submitted_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h2 className="font-heading text-lg font-black text-[var(--color-brand-deep)]">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                  {item.short_description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500 font-mono">
                  <span>Slug: {item.slug}</span>
                  {item.created_by && <span>• Creator ID: {item.created_by}</span>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleInspect(item.id)}
                  disabled={inspectLoading}
                  className="cute-btn cute-btn-secondary inline-flex items-center gap-1.5 py-2 px-3 text-xs font-bold"
                >
                  <Eye className="h-4 w-4 text-[var(--color-brand-primary)]" />
                  <span>{t.moderation.inspectBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(item.id)}
                  disabled={actionBusyId === item.id}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>{t.moderation.approveBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRejectingTripId(item.id);
                    setRejectionReason("");
                  }}
                  disabled={actionBusyId === item.id}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-black text-rose-700 shadow-sm hover:bg-rose-100 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  <span>{t.moderation.rejectBtn}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="cute-card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800 mb-1">
                  ตรวจสอบเนื้อหาทริป
                </span>
                <h2 className="font-heading text-xl font-black text-[var(--color-brand-deep)]">
                  {selectedTrip.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedTrip.province} • {selectedTrip.category} • {selectedTrip.duration_label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedback && (
              <div
                role="status"
                className={`mb-4 flex items-center gap-2 rounded-2xl border-2 p-3 text-xs font-bold ${
                  feedback.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-rose-300 bg-rose-50 text-rose-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-black text-slate-700 mb-1">คำอธิบายทริปเต็ม:</h3>
                <p className="rounded-xl bg-slate-50 p-3 text-slate-700 whitespace-pre-line leading-relaxed border border-slate-200">
                  {selectedTrip.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                </p>
              </div>

              <div>
                <h3 className="font-black text-slate-700 mb-2">
                  จุดแวะในทริป ({(selectedTrip.stops ?? []).length} จุด):
                </h3>
                <div className="space-y-2">
                  {(selectedTrip.stops ?? []).map((stop) => (
                    <div
                      key={stop.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xs font-black text-white">
                          {stop.sequence}
                        </span>
                        <div>
                          <p className="font-black text-slate-800">{stop.place_name}</p>
                          <p className="text-slate-600 text-[11px] line-clamp-2">
                            {stop.description}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Coords: {stop.latitude}, {stop.longitude}
                            {stop.suggested_arrival_time && ` • Time: ${stop.suggested_arrival_time}`}
                            {stop.estimated_cost !== null && ` • Cost: ฿${stop.estimated_cost}`}
                          </p>
                        </div>
                      </div>

                      {stop.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={stop.image_url}
                          alt={stop.place_name}
                          className="h-12 w-16 shrink-0 rounded-lg object-cover border border-slate-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="cute-btn cute-btn-secondary text-xs py-2 px-4 font-bold"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectingTripId(selectedTrip.id);
                  setRejectionReason("");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-300 bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 shadow-sm hover:bg-rose-100"
              >
                <X className="h-4 w-4" />
                <span>{t.moderation.rejectBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedTrip.id)}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-600 px-5 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" />
                <span>{t.moderation.approveBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject with Reason Modal */}
      {rejectingTripId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="cute-card w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <h2 className="font-heading text-lg font-black text-rose-900 mb-1">
              {t.moderation.confirmReject}
            </h2>
            <p className="text-xs text-slate-600 mb-3">
              {t.moderation.rejectReasonPrompt}
            </p>

            <textarea
              required
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t.moderation.rejectReasonPlaceholder}
              className="cute-input w-full text-xs"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingTripId(null);
                  setRejectionReason("");
                }}
                className="cute-btn cute-btn-secondary text-xs py-2 px-4 font-bold"
              >
                {t.moderation.cancel}
              </button>
              <button
                type="button"
                disabled={rejectionReason.trim().length < 3 || actionBusyId !== null}
                onClick={handleRejectSubmit}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-500 bg-rose-600 px-5 py-2 text-xs font-black text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>{t.moderation.confirmReject}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
