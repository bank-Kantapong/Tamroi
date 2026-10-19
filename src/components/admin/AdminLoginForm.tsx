"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, AlertCircle, Sparkles } from "lucide-react";
import { useFormValidityBridge } from "@/components/FormValidityBridge";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "mt-1.5 flex h-11 w-full rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] px-3.5 py-2 text-sm font-bold text-[var(--color-brand-deep)] shadow-[0_3px_0_rgba(9,124,135,0.08)] transition-colors placeholder:font-medium placeholder:text-slate-400 hover:border-[var(--color-accent-aqua)] focus:border-[var(--color-brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-aqua)]/20";

export function AdminLoginForm({
  isUsingDevDefaults,
}: {
  isUsingDevDefaults: boolean;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement | null>(null);
  useFormValidityBridge(formRef);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!formRef.current?.checkValidity()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error while signing in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="cute-card animate-fade-up relative p-6 sm:p-8">
      {/* Cute Top Sticker */}
      <span
        className="pointer-events-none absolute -top-3.5 right-6 inline-flex -rotate-2 items-center gap-1 rounded-full border-2 border-white bg-[var(--color-sun-yellow-light)] px-3 py-1 text-[11px] font-extrabold text-[var(--color-sun-text)] shadow-md"
        aria-hidden="true"
      >
        <Sparkles className="h-3 w-3 text-[var(--color-sun-amber)]" />
        ADMIN ONLY ♡
      </span>

      <div className="flex items-center gap-3.5">
        <span className="flex h-12 w-12 -rotate-3 items-center justify-center rounded-2xl border-2 border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-accent-aqua)] text-white shadow-[0_4px_0_rgba(9,124,135,0.25)]">
          <ShieldCheck className="h-6 w-6 text-[var(--color-sun-yellow-light)]" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-heading text-xl font-black text-[var(--color-brand-deep)]">
            {t.admin.loginTitle}
          </h1>
          <p className="text-xs font-medium text-slate-500">
            {t.admin.loginSubtitle}
          </p>
        </div>
      </div>

      {isUsingDevDefaults && (
        <div className="mt-5 rounded-2xl border-2 border-[var(--color-sun-yellow)] bg-[var(--color-sun-cream)] p-4 text-xs text-[var(--color-sun-text)] shadow-sm">
          <p className="font-extrabold text-[var(--color-brand-deep)]">{t.admin.devModeTitle}</p>
          <p className="mt-0.5 font-medium">{t.admin.devModeDesc}</p>
          <ul className="mt-1.5 list-inside list-disc font-mono text-[11px] font-bold">
            <li>Email: admin@tamroi.local</li>
            <li>Password: tamroi-dev-admin-2026</li>
          </ul>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] p-3.5 text-xs font-extrabold text-[var(--color-coral-text-dark)]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="admin-email"
            className="block text-xs font-extrabold text-[var(--color-brand-deep)]"
          >
            {t.admin.emailLabel} <span className="text-red-600">*</span>
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            aria-errormessage="admin-email-err"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tamroi.local"
            className={inputClass}
          />
          <div id="admin-email-err" className="field-error-msg">
            <span aria-hidden="true">❌</span> กรุณากรอกอีเมลให้ถูกต้อง (Valid email required)
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs font-extrabold text-[var(--color-brand-deep)]"
          >
            {t.admin.passwordLabel} <span className="text-red-600">*</span>
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            aria-errormessage="admin-password-err"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className={inputClass}
          />
          <div id="admin-password-err" className="field-error-msg">
            <span aria-hidden="true">❌</span> กรุณากรอกรหัสผ่าน (Password required)
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="cute-aqua-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold disabled:opacity-50"
        >
          <Lock className="h-4 w-4 text-[var(--color-sun-yellow-light)]" aria-hidden="true" />
          <span>{loading ? t.admin.signingInBtn : t.admin.signInBtn}</span>
        </button>
      </form>
    </div>
  );
}
