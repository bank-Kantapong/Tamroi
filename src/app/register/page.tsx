"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";

function RegisterForm() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters");
      return;
    }

    setIsSubmitting(true);
    const result = await register(email, password, displayName);
    setIsSubmitting(false);

    if (result.success) {
      router.push(returnTo);
      router.refresh();
    } else {
      setError(result.error || "Registration failed");
    }
  }

  return (
    <div className="cute-page-container flex min-h-[calc(100vh-140px)] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[var(--color-brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.detail.backHome}</span>
        </Link>

        <div className="cute-card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-[var(--color-accent-aqua)] to-[var(--color-brand-primary)] text-white shadow-md">
              <UserPlus className="h-6 w-6" />
            </span>
            <h1 className="font-heading text-2xl font-black text-[var(--color-brand-deep)]">
              {t.auth.registerTitle}
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {t.auth.registerSubtitle}
            </p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reg-displayName"
                className="mb-1 block text-xs font-extrabold text-slate-700"
              >
                {t.auth.displayNameLabel}
              </label>
              <input
                id="reg-displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t.auth.displayNamePlaceholder}
                className="cute-input w-full"
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="mb-1 block text-xs font-extrabold text-slate-700"
              >
                {t.auth.emailLabel}
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                className="cute-input w-full"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="mb-1 block text-xs font-extrabold text-slate-700"
              >
                {t.auth.passwordLabel}
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                className="cute-input w-full"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cute-btn cute-btn-primary w-full py-3 text-sm font-black disabled:opacity-50"
            >
              {isSubmitting ? t.auth.registering : t.auth.registerButton}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600">
            <span>{t.auth.haveAccount} </span>
            <Link
              href={`/login${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
              className="font-black text-[var(--color-brand-primary)] hover:underline"
            >
              {t.auth.goToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="cute-page-container py-12 text-center text-xs font-bold text-slate-500">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
