"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilePlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  ExternalLink,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import type { TripListItem, TripStatus } from "@/types/trip";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { SubmissionListSkeleton } from "@/components/skeleton";

export default function SubmissionsDashboardPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<TripListItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?returnTo=/submissions");
      return;
    }

    async function loadSubmissions() {
      try {
        const res = await fetch("/api/submissions", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (err) {
        console.error("Failed to load submissions:", err);
      } finally {
        setFetching(false);
      }
    }

    if (user) {
      loadSubmissions();
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="cute-page-container py-8 sm:py-12 space-y-8">
        <div className="space-y-2">
          <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-8 w-56 rounded-full bg-slate-200 animate-pulse" />
        </div>
        <SubmissionListSkeleton count={3} />
      </div>
    );
  }

  function renderStatusBadge(status: TripStatus) {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            {t.submissions.statusPublished}
          </span>
        );
      case "pending_review":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-0.5 text-xs font-black text-sky-800">
            <Clock className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
            {t.submissions.statusPending}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-xs font-black text-rose-800">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            {t.submissions.statusRejected}
          </span>
        );
      case "draft":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-700">
            <FileEdit className="h-3.5 w-3.5 text-slate-500" />
            {t.submissions.statusDraft}
          </span>
        );
    }
  }

  return (
    <div className="cute-page-container py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[var(--color-brand-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.detail.backHome}</span>
          </Link>
          <h1 className="font-heading text-2xl font-black text-[var(--color-brand-deep)] sm:text-3xl">
            {t.submissions.title}
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
            {t.submissions.subtitle}
          </p>
        </div>

        <Link
          href="/submissions/new"
          className="cute-btn cute-btn-primary inline-flex items-center gap-2 self-start py-2.5 px-5 text-xs font-black"
        >
          <FilePlus className="h-4 w-4" />
          <span>{t.submissions.createNewBtn}</span>
        </Link>
      </div>

      {user.warning_message && (
        <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm">การแจ้งเตือนจากผู้ดูแลระบบ</span>
              {user.warning_count && user.warning_count > 0 ? (
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-800">
                  เตือนสะสม {user.warning_count} ครั้ง
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs font-semibold text-amber-900 leading-relaxed">
              {user.warning_message}
            </p>
          </div>
        </div>
      )}

      {fetching ? (
        <SubmissionListSkeleton count={3} />
      ) : submissions.length === 0 ? (
        <div className="cute-card py-16 px-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] text-[var(--color-brand-primary)]">
            <FilePlus className="h-7 w-7 text-slate-400" />
          </span>
          <h2 className="font-heading text-xl font-black text-[var(--color-brand-deep)]">
            {t.submissions.emptyTitle}
          </h2>
          <p className="mt-2 text-xs font-medium text-slate-600 max-w-md mx-auto">
            {t.submissions.emptySubtitle}
          </p>
          <div className="mt-6">
            <Link
              href="/submissions/new"
              className="cute-btn cute-btn-primary inline-flex items-center gap-2 py-2.5 px-6 text-xs font-black"
            >
              <FilePlus className="h-4 w-4" />
              <span>{t.submissions.createNewBtn}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="cute-card p-5 sm:p-6 transition hover:border-[var(--color-accent-aqua)] flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {renderStatusBadge(sub.status)}
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                    <MapPin className="h-3 w-3 text-[var(--color-brand-primary)]" />
                    {sub.province}
                  </span>
                </div>
                <h2 className="font-heading text-lg font-black text-[var(--color-brand-deep)]">
                  {sub.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-600 line-clamp-2">
                  {sub.short_description}
                </p>
                {sub.rejection_reason && (
                  <div className="mt-3 rounded-2xl border-2 border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                    <strong className="font-black">{t.submissions.rejectionReason}</strong> {sub.rejection_reason}
                  </div>
                )}
                {sub.moderation_note && (
                  <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                    <strong className="font-black">บันทึกเตือนจากผู้ดูแลระบบ:</strong> {sub.moderation_note}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <Link
                  href={`/submissions/${sub.id}/edit`}
                  className="cute-btn cute-btn-secondary inline-flex items-center gap-1.5 py-2 px-3 text-xs font-bold"
                >
                  <FileEdit className="h-3.5 w-3.5" />
                  <span>{t.submissions.editBtn}</span>
                </Link>

                {sub.status === "published" && (
                  <Link
                    href={`/trips/${sub.slug}`}
                    className="cute-btn cute-btn-primary inline-flex items-center gap-1.5 py-2 px-3 text-xs font-bold"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{t.submissions.viewLiveBtn}</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
