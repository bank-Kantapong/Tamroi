"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Ban,
  ShieldCheck,
  X,
  FileText,
  Search,
  ExternalLink,
} from "lucide-react";
import type { AdminUserListItem, TripListItem, TripStatus } from "@/types/trip";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeTrip } from "@/lib/i18n-trips";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { ToastContainer, type ToastMessage } from "@/components/admin/ToastNotification";

interface AdminDashboardClientProps {
  initialTrips: TripListItem[];
  initialUsers?: AdminUserListItem[];
  initialTab?: "posts" | "users";
  adminEmail: string;
  backendName: string;
}

export function AdminDashboardClient({
  initialTrips,
  initialUsers = [],
  initialTab = "posts",
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { locale } = useLanguage();

  const activeTab = initialTab;
  const [trips, setTrips] = useState<TripListItem[]>(initialTrips);
  const [users, setUsers] = useState<AdminUserListItem[]>(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Top-Right Countdown Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function addToast(type: "success" | "error" | "info", message: string) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // Search & Filters for Posts
  const [postSearch, setPostSearch] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [postSourceFilter, setPostSourceFilter] = useState<"all" | "sample" | "community">("all");

  // Search & Filters for Users
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "banned" | "warned">("all");

  // Confirmation Modals (Replacing all window.confirm)
  const [tripToDelete, setTripToDelete] = useState<TripListItem | null>(null);
  const [userToUnban, setUserToUnban] = useState<AdminUserListItem | null>(null);

  // Post Moderation Modal (Unpublish / Warn)
  const [postWarnModal, setPostWarnModal] = useState<{ trip: TripListItem } | null>(null);
  const [postWarnNote, setPostWarnNote] = useState("");

  // User Moderation Modals (Ban / Warn)
  const [userModal, setUserModal] = useState<{
    type: "ban" | "warn";
    user: AdminUserListItem;
  } | null>(null);
  const [userModalText, setUserModalText] = useState("");
  const [userModalError, setUserModalError] = useState<string | null>(null);

  // --- Post Actions ---

  async function handleToggleStatus(trip: TripListItem) {
    const nextStatus: TripStatus = trip.status === "published" ? "draft" : "published";
    setBusyId(trip.id);

    try {
      const res = await fetch(`/api/admin/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        addToast("error", data.error || "ไม่สามารถอัปเดตสถานะทริปได้");
      } else {
        setTrips((prev) =>
          prev.map((item) => (item.id === trip.id ? { ...item, status: nextStatus } : item))
        );
        addToast(
          "success",
          `เปลี่ยนสถานะ "${trip.title}" -> ${nextStatus === "published" ? "เผยแพร่แล้ว" : "แบบร่าง"}`
        );
        router.refresh();
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnpublishWithNoteSubmit() {
    if (!postWarnModal) return;
    const { trip } = postWarnModal;
    const note = postWarnNote.trim() || "เนื้อหาถูกซ่อนโดยผู้ดูแลระบบเนื่องจากต้องมีการตรวจสอบ/แก้ไข";

    setBusyId(trip.id);

    try {
      const res = await fetch(`/api/admin/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft", note }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        addToast("error", data.error || "เกิดข้อผิดพลาดในการซ่อนโพสต์");
      } else {
        setTrips((prev) =>
          prev.map((item) =>
            item.id === trip.id
              ? { ...item, status: "draft", moderation_note: note, rejection_reason: note }
              : item
          )
        );
        addToast("success", `ซ่อนโพสต์ "${trip.title}" และส่งข้อความเตือนให้เจ้าของเรียบร้อยแล้ว`);
        setPostWarnModal(null);
        setPostWarnNote("");
        router.refresh();
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDeleteTrip() {
    if (!tripToDelete) return;
    const trip = tripToDelete;

    setBusyId(trip.id);

    try {
      const res = await fetch(`/api/admin/trips/${trip.id}`, {
        method: "DELETE",
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        addToast("error", data.error || "ไม่สามารถลบโพสต์ได้");
      } else {
        setTrips((prev) => prev.filter((item) => item.id !== trip.id));
        addToast("success", `ลบโพสต์/ทริป "${trip.title}" เรียบร้อยแล้ว`);
        setTripToDelete(null);
        router.refresh();
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setBusyId(null);
    }
  }

  // --- User Moderation Actions ---

  async function handleUserModalSubmit() {
    if (!userModal) return;
    const { type, user } = userModal;

    if (type === "warn" && !userModalText.trim()) {
      setUserModalError("กรุณากรอกข้อความเตือนก่อนส่ง");
      return;
    }

    setBusyId(user.id);
    setUserModalError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: type === "ban" ? "ban" : "warn",
          userId: user.id,
          reason: type === "ban" ? userModalText.trim() || "ฝ่าฝืนกฎชุมชน" : undefined,
          message: type === "warn" ? userModalText.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast("error", data.error || "เกิดข้อผิดพลาดในการดำเนินการ");
      } else {
        if (type === "ban") {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    is_banned: true,
                    banned_reason: userModalText.trim() || "ฝ่าฝืนกฎชุมชน",
                  }
                : u
            )
          );
          setTrips((prev) =>
            prev.map((t) =>
              t.created_by === user.id ? { ...t, status: "draft" as TripStatus } : t
            )
          );
          addToast("success", `ระงับการใช้งาน (แบน) ผู้ใช้ "${user.display_name}" และซ่อนโพสต์ทั้งหมดแล้ว`);
        } else {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    warning_message: userModalText.trim(),
                    warning_count: u.warning_count + 1,
                  }
                : u
            )
          );
          addToast("success", `ส่งคำเตือนไปยังผู้ใช้ "${user.display_name}" เรียบร้อยแล้ว`);
        }
        setUserModal(null);
        setUserModalText("");
        router.refresh();
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmUnbanUser() {
    if (!userToUnban) return;
    const user = userToUnban;

    setBusyId(user.id);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unban", userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast("error", data.error || "ไม่สามารถปลดแบนผู้ใช้ได้");
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_banned: false, banned_reason: null } : u
          )
        );
        addToast("success", `ปลดแบนผู้ใช้ "${user.display_name}" เรียบร้อยแล้ว`);
        setUserToUnban(null);
        router.refresh();
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setBusyId(null);
    }
  }

  async function handleClearWarning(user: AdminUserListItem) {
    setBusyId(user.id);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_warn", userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast("error", data.error || "ไม่สามารถล้างคำเตือนได้");
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, warning_message: null, warning_count: 0 } : u))
        );
        addToast("success", `ล้างข้อความเตือนของผู้ใช้ "${user.display_name}" เรียบร้อยแล้ว`);
        router.refresh();
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setBusyId(null);
    }
  }

  // --- Computed Stats ---
  const publishedCount = trips.filter((t) => t.status === "published").length;
  const draftCount = trips.length - publishedCount;
  const bannedUsersCount = users.filter((u) => u.is_banned).length;
  const warnedUsersCount = users.filter((u) => !u.is_banned && u.warning_message).length;

  // --- Filtering Posts ---
  const filteredTrips = trips.filter((t) => {
    if (postSearch.trim()) {
      const q = postSearch.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchProvince = t.province.toLowerCase().includes(q);
      const matchCategory = t.category.toLowerCase().includes(q);
      const matchSlug = t.slug.toLowerCase().includes(q);
      if (!matchTitle && !matchProvince && !matchCategory && !matchSlug) return false;
    }
    if (postStatusFilter !== "all" && t.status !== postStatusFilter) return false;
    if (postSourceFilter === "sample" && !t.is_sample) return false;
    if (postSourceFilter === "community" && t.is_sample) return false;

    return true;
  });

  // --- Filtering Users ---
  const filteredUsers = users.filter((u) => {
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.display_name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    if (userStatusFilter === "active" && (u.is_banned || u.warning_message)) return false;
    if (userStatusFilter === "banned" && !u.is_banned) return false;
    if (userStatusFilter === "warned" && (u.is_banned || !u.warning_message)) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* 5-second countdown Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} durationMs={5000} />

      {/* Delete Trip Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(tripToDelete)}
        title="ยืนยันการลบโพสต์ / ทริป"
        description={
          tripToDelete ? (
            <div>
              คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์{" "}
              <strong className="text-slate-900 font-bold">&quot;{tripToDelete.title}&quot;</strong>{" "}
              พร้อมข้อมูลจุดแวะทั้งหมด?
              <div className="mt-2 text-rose-600 font-semibold text-[11px]">
                * การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลจะถูกลบออกจากฐานข้อมูลอย่างถาวร
              </div>
            </div>
          ) : null
        }
        confirmText="ยืนยันลบถาวร"
        cancelText="ยกเลิก"
        variant="danger"
        isLoading={busyId === tripToDelete?.id}
        onConfirm={confirmDeleteTrip}
        onCancel={() => setTripToDelete(null)}
      />

      {/* Unban User Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(userToUnban)}
        title="ยืนยันปลดระงับการใช้งาน (ปลดแบน)"
        description={
          userToUnban ? (
            <div>
              คุณต้องการปลดแบนผู้ใช้{" "}
              <strong className="text-slate-900 font-bold">&quot;{userToUnban.display_name}&quot;</strong>{" "}
              ({userToUnban.email}) หรือไม่? บัญชีจะสามารถกลับเข้าสู่ระบบได้ตามปกติ
            </div>
          ) : null
        }
        confirmText="ยืนยันปลดแบน"
        cancelText="ยกเลิก"
        variant="info"
        isLoading={busyId === userToUnban?.id}
        onConfirm={confirmUnbanUser}
        onCancel={() => setUserToUnban(null)}
      />

      {/* Top Banner */}
      <div>
        <h1 className="font-heading text-2xl font-black text-slate-900 tracking-tight">
          {activeTab === "users" ? "จัดการผู้ใช้งาน (User Management)" : "จัดการโพสต์ & ทริป (Posts & Trips)"}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          {activeTab === "users"
            ? "ตรวจสอบสมาชิกในระบบ จัดการสถานะบัญชี ตักเตือน หรือระงับการใช้งาน"
            : "จัดการและควบคุมคุณภาพทริปท่องเที่ยว รีวิวเดี่ยว และเนื้อหาจากคอมมูนิตี้"}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">โพสต์ทั้งหมด</span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{trips.length}</div>
          <div className="mt-1 text-[10px] text-slate-500 font-medium">รวมตัวอย่าง & สมาชิก</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold">เผยแพร่อยู่</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-800">{publishedCount}</div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">แสดงผลสาธารณะ</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">แบบร่าง/ซ่อน</span>
            <span className="h-2 w-2 rounded-full bg-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-700">{draftCount}</div>
          <div className="mt-1 text-[10px] text-slate-500 font-medium">ยังไม่เปิดสาธารณะ</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">ผู้ใช้ทั้งหมด</span>
            <span className="h-2 w-2 rounded-full bg-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{users.length}</div>
          <div className="mt-1 text-[10px] text-slate-500 font-medium">สมาชิกที่ลงทะเบียน</div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-bold">ผู้ใช้ที่ถูกแบน</span>
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-800">{bannedUsersCount}</div>
          <div className="mt-1 text-[10px] text-rose-600 font-semibold">ระงับการเข้าสู่ระบบ</div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold">ผู้ใช้ที่มีคำเตือน</span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900">{warnedUsersCount}</div>
          <div className="mt-1 text-[10px] text-amber-700 font-semibold">ส่งคำเตือนไปยังผู้ใช้</div>
        </div>
      </div>

      {/* Main Console Workspace Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* ========================================================================= */}
        {/* VIEW 1: POSTS & TRIPS MANAGEMENT                                          */}
        {/* ========================================================================= */}
        {activeTab === "posts" && (
          <div className="p-6 space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="ค้นหาตามชื่อทริป, จังหวัด, หมวดหมู่, หรือ slug..."
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
                />
                {postSearch && (
                  <button
                    type="button"
                    onClick={() => setPostSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={postStatusFilter}
                  onChange={(e) => setPostStatusFilter(e.target.value as "all" | "published" | "draft")}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:border-teal-600 focus:outline-none"
                >
                  <option value="all">สถานะ: ทั้งหมด</option>
                  <option value="published">เผยแพร่แล้ว (Published)</option>
                  <option value="draft">แบบร่าง / ซ่อน (Draft)</option>
                </select>

                <select
                  value={postSourceFilter}
                  onChange={(e) => setPostSourceFilter(e.target.value as "all" | "sample" | "community")}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:border-teal-600 focus:outline-none"
                >
                  <option value="all">แหล่งที่มา: ทั้งหมด</option>
                  <option value="sample">ทริปตัวอย่าง (Sample / Curator)</option>
                  <option value="community">สมาชิก (Community)</option>
                </select>
              </div>
            </div>

            {/* Status Legend Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 px-1 font-medium">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700">สถานะโพสต์:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>เผยแพร่อยู่ (Published)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>แบบร่าง / ซ่อน (Draft)</span>
                </span>
              </div>
              <div>พบ {filteredTrips.length} รายการ</div>
            </div>

            {/* Posts Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {filteredTrips.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-slate-500">
                  ไม่พบข้อมูลทริปที่ตรงตามเงื่อนไขการค้นหา
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs table-fixed">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                        <th className="px-4 py-3 w-[50%]">ชื่อทริป / โพสต์</th>
                        <th className="px-3 py-3 w-[12%] text-center">จุดแวะ</th>
                        <th className="px-3 py-3 w-[15%]">ผู้สร้าง</th>
                        <th className="px-3 py-3 w-[8%] text-center">สถานะ</th>
                        <th className="px-4 py-3 w-[15%] text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTrips.map((rawTrip) => {
                        const trip = localizeTrip(rawTrip, locale);
                        const hasNote = Boolean(rawTrip.moderation_note || rawTrip.rejection_reason);

                        return (
                          <tr key={trip.id} className="transition hover:bg-slate-50/80">
                            {/* Column 1: Image + Title + Subtitle (Province, Category, Duration) */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                                  {trip.cover_image_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={trip.cover_image_url.split(/[\n,]/)[0]}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <FileText className="h-5 w-5 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-heading font-black text-slate-900 truncate" title={trip.title}>
                                      {trip.title}
                                    </span>
                                    {trip.is_sample && (
                                      <span className="shrink-0 inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-800">
                                        <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                                        Curator
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                    <span className="font-bold text-slate-700">{trip.province}</span>
                                    <span className="mx-1">&bull;</span>
                                    <span>{trip.category}</span>
                                    <span className="mx-1">&bull;</span>
                                    <span>{trip.duration_label}</span>
                                  </div>
                                  {hasNote && (
                                    <div className="mt-1 rounded border border-amber-300 bg-amber-50/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 truncate" title={rawTrip.moderation_note || rawTrip.rejection_reason || undefined}>
                                      ⚠️ โน้ตเตือน: {rawTrip.moderation_note || rawTrip.rejection_reason}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Column 2: Stops Count (Number only) */}
                            <td className="px-3 py-3 text-center">
                              <span
                                className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-700 border border-slate-200"
                                title={trip.stop_count > 0 ? `${trip.stop_count} จุดแวะ` : "รีวิวเดี่ยว (0 จุดแวะ)"}
                              >
                                {trip.stop_count}
                              </span>
                            </td>

                            {/* Column 3: Creator */}
                            <td className="px-3 py-3">
                              <span className="text-[11px] font-medium text-slate-600 truncate block" title={trip.is_sample ? "ทีมงาน (System)" : trip.created_by ? `User (${trip.created_by})` : "ไม่ระบุ"}>
                                {trip.is_sample ? "ทีมงาน (System)" : trip.created_by ? `User (${trip.created_by.slice(0, 8)})` : "ไม่ระบุ"}
                              </span>
                            </td>

                            {/* Column 4: Status (Dot only) */}
                            <td className="px-3 py-3 text-center">
                              {trip.status === "published" ? (
                                <span
                                  className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"
                                  title="เผยแพร่อยู่ (Published)"
                                />
                              ) : (
                                <span
                                  className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400 ring-4 ring-slate-100"
                                  title="แบบร่าง / ซ่อน (Draft)"
                                />
                              )}
                            </td>

                            {/* Column 5: Actions (Icons only with tooltips) */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {trip.status === "published" && (
                                  <a
                                    href={`/trips/${trip.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-teal-600 hover:border-teal-300 shadow-2xs transition"
                                    title="เปิดดูหน้าเว็บจริง (View Live)"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}

                                <Link
                                  href={`/admin/trips/${trip.id}/edit`}
                                  className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-2xs transition"
                                  title="แก้ไขข้อมูลทริป (Edit)"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Link>

                                {trip.status === "published" ? (
                                  <button
                                    type="button"
                                    disabled={busyId === trip.id}
                                    onClick={() => setPostWarnModal({ trip: rawTrip })}
                                    className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                                    title="ซ่อนโพสต์และส่งคำเตือน (Unpublish & Warn)"
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={busyId === trip.id}
                                    onClick={() => handleToggleStatus(rawTrip)}
                                    className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition"
                                    title="เผยแพร่สู่สาธารณะ (Publish)"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={busyId === trip.id}
                                  onClick={() => setTripToDelete(rawTrip)}
                                  className="p-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition"
                                  title="ลบโพสต์ถาวร (Delete)"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: USER MANAGEMENT (BAN / WARN / UNBAN)                              */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <div className="p-6 space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ค้นหาตามชื่อผู้ใช้ หรืออีเมล..."
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
                />
                {userSearch && (
                  <button
                    type="button"
                    onClick={() => setUserSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as "all" | "active" | "banned" | "warned")}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:border-teal-600 focus:outline-none"
              >
                <option value="all">สถานะผู้ใช้: ทั้งหมด</option>
                <option value="active">ปกติ (Active)</option>
                <option value="banned">ถูกระงับการใช้งาน (Banned)</option>
                <option value="warned">มีคำเตือนสะสม (Warned)</option>
              </select>
            </div>

            {/* Status Legend Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 px-1 font-medium">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700">สถานะผู้ใช้:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>ปกติ (Active)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>มีคำเตือนสะสม (Warned)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>ถูกระงับการใช้งาน (Banned)</span>
                </span>
              </div>
              <div>พบ {filteredUsers.length} รายการ</div>
            </div>

            {/* Users Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-slate-500">
                  ไม่พบข้อมูลผู้ใช้งานที่ตรงตามเงื่อนไข
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs table-fixed">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                        <th className="px-4 py-3 w-[45%]">ผู้ใช้งาน & อีเมล</th>
                        <th className="px-3 py-3 w-[15%]">บทบาท</th>
                        <th className="px-3 py-3 w-[12%] text-center">จำนวนโพสต์</th>
                        <th className="px-3 py-3 w-[12%] text-center">สถานะ</th>
                        <th className="px-4 py-3 w-[16%] text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="transition hover:bg-slate-50/80">
                          {/* User Name & Email */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-teal-300">
                                {u.display_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-heading font-black text-slate-900 truncate" title={u.display_name}>
                                  {u.display_name}
                                </div>
                                <div className="font-mono text-[11px] text-slate-500 truncate" title={u.email}>{u.email}</div>
                                {u.is_banned && u.banned_reason && (
                                  <div className="mt-1 rounded border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-900 truncate" title={u.banned_reason}>
                                    🚫 สาเหตุ: {u.banned_reason}
                                  </div>
                                )}
                                {!u.is_banned && u.warning_message && (
                                  <div className="mt-1 rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900 truncate" title={u.warning_message}>
                                    ⚠️ เตือน: {u.warning_message} ({u.warning_count} ครั้ง)
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                                u.role === "admin"
                                  ? "border border-teal-300 bg-teal-50 text-teal-900"
                                  : "border border-slate-300 bg-slate-50 text-slate-700"
                              }`}
                            >
                              {u.role === "admin" ? "ผู้ดูแลระบบ" : "สมาชิก"}
                            </span>
                          </td>

                          {/* Post count (Number only) */}
                          <td className="px-3 py-3 text-center">
                            <span
                              className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-700 border border-slate-200"
                              title={`${u.post_count} ทริป`}
                            >
                              {u.post_count}
                            </span>
                          </td>

                          {/* Account status (Dot only) */}
                          <td className="px-3 py-3 text-center">
                            {u.is_banned ? (
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-rose-50"
                                title={`ถูกระงับการใช้งาน (Banned): ${u.banned_reason || ""}`}
                              />
                            ) : u.warning_message ? (
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-50"
                                title={`มีคำเตือนสะสม (${u.warning_count} ครั้ง)`}
                              />
                            ) : (
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"
                                title="สถานะปกติ (Active)"
                              />
                            )}
                          </td>

                          {/* Actions (Icons only with tooltips) */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Warn Button */}
                              {!u.is_banned && (
                                <button
                                  type="button"
                                  disabled={busyId === u.id}
                                  onClick={() => {
                                    setUserModalError(null);
                                    setUserModal({ type: "warn", user: u });
                                  }}
                                  className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 disabled:opacity-50 transition"
                                  title="ส่งคำเตือนไปยังผู้ใช้ (Warn)"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                </button>
                              )}

                              {/* Clear Warning Button */}
                              {!u.is_banned && u.warning_message && (
                                <button
                                  type="button"
                                  disabled={busyId === u.id}
                                  onClick={() => handleClearWarning(u)}
                                  className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                                  title="ล้างประวัติคำเตือน (Clear Warning)"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                                </button>
                              )}

                              {/* Ban / Unban Button */}
                              {u.is_banned ? (
                                <button
                                  type="button"
                                  disabled={busyId === u.id}
                                  onClick={() => setUserToUnban(u)}
                                  className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 transition"
                                  title="ปลดการระงับการใช้งาน (Unban)"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={busyId === u.id}
                                  onClick={() => {
                                    setUserModalError(null);
                                    setUserModal({ type: "ban", user: u });
                                  }}
                                  className="p-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 disabled:opacity-50 transition"
                                  title="ระงับการใช้งานบัญชี (Ban)"
                                >
                                  <Ban className="h-3.5 w-3.5 text-rose-600" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: POST UNPUBLISH WITH WARNING NOTE                                   */}
      {/* ========================================================================= */}
      {postWarnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-amber-300 bg-white p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-base font-black text-amber-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>ซ่อนโพสต์และส่งคำเตือน</span>
              </h3>
              <button
                type="button"
                onClick={() => setPostWarnModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed font-medium">
              โพสต์: <strong className="text-slate-900">{postWarnModal.trip.title}</strong>
              <br />
              สถานะจะเปลี่ยนเป็นแบบร่าง (ซ่อนจากหน้าเว็บ) และส่งโน้ตเตือนให้เจ้าของทริปเห็น
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ระบุเหตุผลหรือคำแนะนำในการแก้ไข
              </label>
              <textarea
                rows={3}
                value={postWarnNote}
                onChange={(e) => setPostWarnNote(e.target.value)}
                placeholder="เช่น เนื้อหามีข้อความไม่เหมาะสม หรือรูปภาพมีลิขสิทธิ์ กรุณาแก้ไขก่อนเผยแพร่ใหม่..."
                className="w-full border border-amber-300 bg-amber-50/40 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPostWarnModal(null)}
                className="border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={busyId === postWarnModal.trip.id}
                onClick={handleUnpublishWithNoteSubmit}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold rounded-xl shadow-xs"
              >
                ยืนยันซ่อนและส่งคำเตือน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: USER BAN OR WARN                                                   */}
      {/* ========================================================================= */}
      {userModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading text-base font-black text-slate-900 flex items-center gap-2">
                {userModal.type === "ban" ? (
                  <>
                    <Ban className="h-5 w-5 text-rose-600" />
                    <span>ระงับการใช้งานผู้ใช้ (แบน)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span>ส่งคำเตือนไปยังผู้ใช้</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setUserModal(null);
                  setUserModalError(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed font-medium">
              ผู้ใช้: <strong className="text-slate-900">{userModal.user.display_name}</strong> ({userModal.user.email})
              {userModal.type === "ban" && (
                <span className="block mt-1 text-rose-600 font-semibold">
                  * เมื่อถูกแบน ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้ และทริปทั้งหมดของผู้ใช้นี้จะถูกซ่อนออกจากหน้าเว็บทันที
                </span>
              )}
            </p>

            {userModalError && (
              <div className="mt-3 rounded-lg border border-rose-300 bg-rose-50 p-2 text-xs font-semibold text-rose-700">
                {userModalError}
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {userModal.type === "ban" ? "ระบุเหตุผลการแบนผู้ใช้" : "ข้อความคำเตือน"}
              </label>
              <textarea
                rows={3}
                value={userModalText}
                onChange={(e) => {
                  setUserModalText(e.target.value);
                  if (userModalError) setUserModalError(null);
                }}
                placeholder={
                  userModal.type === "ban"
                    ? "เช่น สแปมเนื้อหา, ใช้คำหยาบคายรุนแรงซ้ำซาก, ละเมิดข้อกำหนดชุมชน..."
                    : "เช่น กรุณาใช้ถ้อยคำที่สุภาพและตรวจสอบพิกัดสถานที่ให้ถูกต้อง..."
                }
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setUserModal(null);
                  setUserModalError(null);
                }}
                className="border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={busyId === userModal.user.id}
                onClick={handleUserModalSubmit}
                className={`text-white px-4 py-2 text-xs font-bold rounded-xl shadow-xs ${
                  userModal.type === "ban"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {userModal.type === "ban" ? "ยืนยันระงับการใช้งาน" : "ส่งคำเตือน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
