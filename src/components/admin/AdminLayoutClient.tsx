"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Users,
  PlusCircle,
  RotateCcw,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Database,
  ChevronRight,
} from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { ToastContainer, type ToastMessage } from "@/components/admin/ToastNotification";

interface AdminLayoutClientProps {
  isAuthenticated: boolean;
  adminEmail: string;
  backendName: string;
  children: React.ReactNode;
}

export function AdminLayoutClient({
  isAuthenticated,
  adminEmail,
  backendName,
  children,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function addToast(type: "success" | "error" | "info", message: string) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const isLoginPage = pathname === "/admin/login";

  // If user is on the login page or not authenticated, render the dedicated admin auth shell
  if (isLoginPage || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  }

  async function executeResetSeed() {
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      if (res.ok) {
        addToast("success", "รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว");
        setShowResetConfirm(false);
        router.refresh();
      } else {
        addToast("error", "เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล");
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsResetting(false);
    }
  }

  const navItems = [
    {
      label: "แดชบอร์ดภาพรวม",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin" && (typeof window !== "undefined" ? !window.location.search.includes("tab=") : true),
    },
    {
      label: "จัดการโพสต์ & ทริป",
      href: "/admin?tab=posts",
      icon: FileText,
      active: pathname === "/admin" && (typeof window !== "undefined" ? window.location.search.includes("tab=posts") : false),
    },
    {
      label: "จัดการผู้ใช้งาน",
      href: "/admin?tab=users",
      icon: Users,
      active: pathname === "/admin" && (typeof window !== "undefined" ? window.location.search.includes("tab=users") : false),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row antialiased">
      {/* Toast Notifications in top-right */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} durationMs={5000} />

      {/* Reset Seed Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="ยืนยันรีเซ็ตข้อมูลตัวอย่าง"
        description="คุณต้องการรีเซ็ตฐานข้อมูลเป็นทริปตัวอย่างเริ่มต้นหรือไม่? ข้อมูลทริปที่เคยแก้ไขหรือสร้างใหม่จะถูกแทนที่ด้วยข้อมูลเริ่มต้น"
        confirmText="ยืนยันรีเซ็ต"
        cancelText="ยกเลิก"
        variant="warning"
        isLoading={isResetting}
        onConfirm={executeResetSeed}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Mobile Top App Bar */}
      <header className="lg:hidden flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-heading text-sm font-black tracking-wide text-white">TAMROI</span>
            <span className="ml-1.5 rounded-md bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-black text-teal-300">
              Back-Office
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Desktop / Mobile Backdrop Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-800 bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out lg:sticky lg:h-screen lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo / Console Header */}
          <div className="border-b border-slate-800/80 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 shadow-lg shadow-teal-900/40">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-base font-black tracking-wider text-white">TAMROI</span>
                  <span className="rounded-md bg-teal-500/20 border border-teal-500/30 px-1.5 py-0.5 text-[9px] font-black uppercase text-teal-300">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">ระบบจัดการหลังบ้าน (Back-Office)</p>
              </div>
            </div>

            {/* System Engine Status */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-bold text-slate-300">System Online</span>
              </div>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-teal-400">
                <Database className="h-3 w-3" />
                {backendName}
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-4 py-4 flex-1 space-y-6">
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                เมนูหลัก (Management)
              </p>
              <nav className="mt-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                        item.active
                          ? "bg-teal-600 text-white shadow-md shadow-teal-950/40"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${item.active ? "text-white" : "text-slate-400 group-hover:text-teal-300"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.active && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* System Actions */}
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                เครื่องมือระบบ (System Tools)
              </p>
              <div className="mt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={isResetting}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800/80 hover:text-amber-300 transition-colors disabled:opacity-50 text-left"
                >
                  <RotateCcw className={`h-4 w-4 text-slate-400 ${isResetting ? "animate-spin" : ""}`} />
                  <span>{isResetting ? "กำลังรีเซ็ต..." : "รีเซ็ตข้อมูลตัวอย่าง (Reset Seed)"}</span>
                </button>

                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800/80 hover:text-teal-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                    <span>เปิดดูหน้าเว็บจริง (Live Site)</span>
                  </div>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400">Public</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Admin User Profile & Logout (Bottom of Sidebar) */}
        <div className="border-t border-slate-800/90 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-heading text-xs font-black text-teal-300 border border-slate-700">
                AD
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{adminEmail}</p>
                <div className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-slate-400">Super Admin</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="ออกจากระบบแอดมิน"
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:border-rose-900/50 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar (Desktop & Tablet) */}
        <div className="hidden lg:flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3.5 shadow-2xs">
          <div></div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-teal-700"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              <span>เปิดหน้าเว็บจริง (Live Website)</span>
            </a>

            <Link
              href="/admin/trips/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-teal-700 active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>เพิ่มทริปใหม่</span>
            </Link>
          </div>
        </div>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
