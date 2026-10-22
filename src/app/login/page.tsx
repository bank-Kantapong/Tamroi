"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";

function LoginForm() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push(returnTo);
      router.refresh();
    } else {
      setError(result.error || "Login failed");
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
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-md">
              <LogIn className="h-6 w-6" />
            </span>
            <h1 className="font-heading text-2xl font-black text-[var(--color-brand-deep)]">
              {t.auth.loginTitle}
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {t.auth.loginSubtitle}
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
                htmlFor="login-email"
                className="mb-1 block text-xs font-extrabold text-slate-700"
              >
                {t.auth.emailLabel}
              </label>
              <input
                id="login-email"
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
                htmlFor="login-password"
                className="mb-1 block text-xs font-extrabold text-slate-700"
              >
                {t.auth.passwordLabel}
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="cute-input w-full"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cute-btn cute-btn-primary w-full py-3 text-sm font-black disabled:opacity-50"
            >
              {isSubmitting ? t.auth.loggingIn : t.auth.loginButton}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600">
            <span>{t.auth.noAccount} </span>
            <Link
              href={`/register${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
              className="font-black text-[var(--color-brand-primary)] hover:underline"
            >
              {t.auth.goToRegister}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="cute-page-container py-12 text-center text-xs font-bold text-slate-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
