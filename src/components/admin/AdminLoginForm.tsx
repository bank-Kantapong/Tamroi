"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { useFormValidityBridge } from "@/components/FormValidityBridge";
import { useLanguage } from "@/components/LanguageProvider";

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
        setError(data.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      setLoading(false);
    }
  }

  function fillDevCredentials() {
    setEmail("admin@tamroi.local");
    setPassword("tamroi-dev-admin-2026");
  }

  return (
    <div className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-slate-100">
      {/* Admin Branding Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 shadow-lg shadow-teal-950/60 text-white mb-4">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-heading text-xl font-black tracking-wide text-white">TAMROI ADMIN</span>
          <span className="rounded-md bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 text-[10px] font-black uppercase text-teal-300">
            Console
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          ระบบจัดการหลังบ้านเฉพาะผู้ดูแลระบบ (Back-Office Access Only)
        </p>
      </div>

      {isUsingDevDefaults && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-amber-300">
              <KeyRound className="h-3.5 w-3.5" />
              โหมดทดสอบในเครื่อง (Dev Defaults)
            </span>
            <button
              type="button"
              onClick={fillDevCredentials}
              className="text-[11px] underline hover:text-white font-semibold"
            >
              กรอกอัตโนมัติ
            </button>
          </div>
          <div className="mt-2 font-mono text-[11px] space-y-0.5 text-slate-300">
            <div>Email: <strong className="text-amber-100">admin@tamroi.local</strong></div>
            <div>Password: <strong className="text-amber-100">tamroi-dev-admin-2026</strong></div>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/15 p-3.5 text-xs font-semibold text-rose-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="admin-email"
            className="block text-xs font-bold text-slate-300 mb-1.5"
          >
            {t.admin.emailLabel} <span className="text-rose-400">*</span>
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tamroi.local"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-slate-500 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs font-bold text-slate-300 mb-1.5"
          >
            {t.admin.passwordLabel} <span className="text-rose-400">*</span>
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-slate-500 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold py-3 text-xs shadow-lg shadow-teal-950/50 transition active:scale-[0.98] disabled:opacity-50 mt-2"
        >
          <Lock className="h-4 w-4" />
          <span>{loading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบหลังบ้าน (Sign In)"}</span>
        </button>
      </form>

      <div className="mt-6 border-t border-slate-800 pt-5 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>กลับไปยังหน้าหลักของเว็บไซต์ (Back to Website)</span>
        </Link>
      </div>
    </div>
  );
}
