"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, AlertCircle, ArrowLeft, Shield, Mail } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { ProfileSkeleton } from "@/components/skeleton";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?returnTo=/profile");
    } else if (user) {
      setDisplayName(user.display_name || "");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim(),
          avatar_url: avatarUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile");
      } else {
        setSuccess(true);
        await refreshUser();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="cute-page-container py-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[var(--color-brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.detail.backHome}</span>
        </Link>

        <div className="cute-card p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-center sm:gap-6 border-b border-slate-100 pb-6 text-center sm:text-left">
            <div className="relative mb-3 sm:mb-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-20 w-20 rounded-full border-4 border-white shadow-md object-cover bg-slate-100"
                  onError={() => setAvatarUrl("")}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-md text-2xl font-black">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-heading text-2xl font-black text-[var(--color-brand-deep)]">
                {t.profile.title}
              </h1>
              <p className="mt-1 text-xs text-slate-600">{t.profile.subtitle}</p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-2xl border-2 border-rose-300 bg-rose-50 p-3.5 text-xs font-bold text-rose-800"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 flex items-center gap-2.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800"
            >
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{t.profile.savedSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-700">
                {t.profile.email}
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{user.email}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-700">
                {t.profile.role}
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-600">
                <Shield className="h-4 w-4 text-[var(--color-brand-primary)]" />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-display-name"
                className="mb-1 block text-xs font-extrabold text-slate-700"
              >
                {t.profile.displayName}
              </label>
              <input
                id="profile-display-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="cute-input w-full"
              />
            </div>

            <div>
              <label
                htmlFor="profile-avatar-url"
                className="mb-1 block text-xs font-extrabold text-slate-700"
              >
                {t.profile.avatarUrl}
              </label>
              <input
                id="profile-avatar-url"
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder={t.profile.avatarPlaceholder}
                className="cute-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cute-btn cute-btn-primary w-full py-3 text-sm font-black disabled:opacity-50"
            >
              {isSubmitting ? t.profile.saving : t.profile.saveChanges}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
