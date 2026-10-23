"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Car,
  Footprints,
  Train,
  Bike,
  FileEdit,
} from "lucide-react";
import type { TravelMode, TripStatus, TripStop, TripWithStops } from "@/types/trip";
import dynamic from "next/dynamic";
import { slugify } from "@/lib/validation";
import { formatCoordinatePair } from "@/lib/google-maps";
import { useFormValidityBridge } from "@/components/FormValidityBridge";
import { CustomDropdown, DropdownOption } from "@/components/CustomDropdown";
import { ImageUploadField, MultiImageUploadField } from "@/components/common";
import { ConfirmModal } from "./ConfirmModal";

const LocationPickerMap = dynamic(
  () => import("@/components/trip/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[240px] w-full items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-400">
        กำลังโหลดแผนที่ปักหมุด (Loading map)...
      </div>
    ),
  }
);

interface TripEditorClientProps {
  mode: "create" | "edit";
  initialTrip?: TripWithStops;
}

interface StopFormState {
  id: string | null;
  place_name: string;
  description: string;
  latitude: string;
  longitude: string;
  image_url: string;
  estimated_minutes: string;
  suggested_arrival_time: string;
  estimated_cost: string;
  notes: string;
}

const EMPTY_STOP_FORM: StopFormState = {
  id: null,
  place_name: "",
  description: "",
  latitude: "",
  longitude: "",
  image_url: "",
  estimated_minutes: "",
  suggested_arrival_time: "",
  estimated_cost: "",
  notes: "",
};

const inputClass =
  "mt-1.5 flex h-11 w-full rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] px-3.5 py-2 text-sm font-bold text-[var(--color-brand-deep)] shadow-[0_3px_0_rgba(9,124,135,0.08)] transition-colors placeholder:font-medium placeholder:text-slate-400 hover:border-[var(--color-accent-aqua)] focus:border-[var(--color-brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-aqua)]/20";

const textareaClass =
  "mt-1.5 flex w-full rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] px-3.5 py-2.5 text-sm font-bold text-[var(--color-brand-deep)] shadow-[0_3px_0_rgba(9,124,135,0.08)] transition-colors placeholder:font-medium placeholder:text-slate-400 hover:border-[var(--color-accent-aqua)] focus:border-[var(--color-brand-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-aqua)]/20";

const labelClass = "block text-xs font-extrabold text-[var(--color-brand-deep)]";

const TRAVEL_MODE_OPTIONS: DropdownOption[] = [
  {
    value: "driving",
    label: "ขับรถเที่ยว (Driving)",
    badgeColor: "var(--color-brand-primary)",
    icon: <Car className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    value: "walking",
    label: "เดินชิลล์ (Walking)",
    badgeColor: "var(--color-accent-aqua)",
    icon: <Footprints className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    value: "transit",
    label: "รถสาธารณะ (Transit)",
    badgeColor: "var(--color-sun-yellow-light)",
    icon: <Train className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    value: "bicycling",
    label: "ปั่นจักรยาน (Cycling)",
    badgeColor: "var(--color-peach)",
    icon: <Bike className="h-3.5 w-3.5" aria-hidden="true" />,
  },
];

const STATUS_OPTIONS: DropdownOption[] = [
  {
    value: "draft",
    label: "Draft (ซ่อนไว้ก่อน)",
    badgeColor: "var(--color-peach)",
    icon: <FileEdit className="h-3.5 w-3.5" aria-hidden="true" />,
  },
  {
    value: "published",
    label: "Published (แสดงหน้าเว็บ)",
    badgeColor: "var(--color-sage)",
    icon: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
  },
];

export function TripEditorClient({ mode, initialTrip }: TripEditorClientProps) {
  const router = useRouter();
  const tripFormRef = useRef<HTMLFormElement | null>(null);
  const stopFormRef = useRef<HTMLFormElement | null>(null);

  useFormValidityBridge(tripFormRef);
  useFormValidityBridge(stopFormRef);

  const [title, setTitle] = useState(initialTrip?.title ?? "");
  const [slug, setSlug] = useState(initialTrip?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(
    initialTrip?.short_description ?? ""
  );
  const [description, setDescription] = useState(initialTrip?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialTrip?.cover_image_url ?? ""
  );
  const [province, setProvince] = useState(initialTrip?.province ?? "Bangkok");
  const [category, setCategory] = useState(
    initialTrip?.category ?? "Culture & Heritage"
  );
  const [durationLabel, setDurationLabel] = useState(
    initialTrip?.duration_label ?? "1 Day (6 hrs)"
  );
  const [durationHours, setDurationHours] = useState(
    initialTrip?.duration_hours !== null && initialTrip?.duration_hours !== undefined
      ? String(initialTrip.duration_hours)
      : "6"
  );
  const [budgetMin, setBudgetMin] = useState(
    initialTrip?.budget_min !== null && initialTrip?.budget_min !== undefined
      ? String(initialTrip.budget_min)
      : ""
  );
  const [budgetMax, setBudgetMax] = useState(
    initialTrip?.budget_max !== null && initialTrip?.budget_max !== undefined
      ? String(initialTrip.budget_max)
      : ""
  );
  const [travelMode, setTravelMode] = useState<TravelMode>(
    initialTrip?.travel_mode ?? "driving"
  );
  const [status, setStatus] = useState<TripStatus>(
    initialTrip?.status ?? "draft"
  );
  const [isSample, setIsSample] = useState<boolean>(
    initialTrip?.is_sample ?? false
  );
  const [headerLat, setHeaderLat] = useState<string>(
    initialTrip?.latitude !== null && initialTrip?.latitude !== undefined
      ? String(initialTrip.latitude)
      : ""
  );
  const [headerLng, setHeaderLng] = useState<string>(
    initialTrip?.longitude !== null && initialTrip?.longitude !== undefined
      ? String(initialTrip.longitude)
      : ""
  );
  const [locationName, setLocationName] = useState<string>(
    initialTrip?.location_name ?? ""
  );

  const [tripSaving, setTripSaving] = useState(false);
  const [tripFeedback, setTripFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [stops, setStops] = useState<TripStop[]>(
    () => [...(initialTrip?.stops ?? [])].sort((a, b) => a.sequence - b.sequence)
  );
  const [stopForm, setStopForm] = useState<StopFormState>(EMPTY_STOP_FORM);
  const [stopSaving, setStopSaving] = useState(false);
  const [stopFeedback, setStopFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [stopToDelete, setStopToDelete] = useState<TripStop | null>(null);

  function handleAutoSlug() {
    const generated = slugify(title);
    if (generated) {
      setSlug(generated);
    }
  }

  async function handleSaveTrip(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTripFeedback(null);

    if (!tripFormRef.current?.checkValidity()) {
      return;
    }

    setTripSaving(true);
    try {
      const parsedHeaderLat =
        headerLat.trim() !== "" ? Number(headerLat) : null;
      const parsedHeaderLng =
        headerLng.trim() !== "" ? Number(headerLng) : null;

      const payload = {
        title,
        slug,
        short_description: shortDescription,
        description,
        cover_image_url: coverImageUrl || null,
        province,
        category,
        duration_label: durationLabel,
        duration_hours: durationHours ? Number(durationHours) : null,
        budget_min: budgetMin !== "" ? Number(budgetMin) : null,
        budget_max: budgetMax !== "" ? Number(budgetMax) : null,
        travel_mode: travelMode,
        status,
        is_sample: isSample,
        latitude: parsedHeaderLat,
        longitude: parsedHeaderLng,
        location_name: locationName.trim() || null,
      };

      const url =
        mode === "create"
          ? "/api/admin/trips"
          : `/api/admin/trips/${initialTrip!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        trip?: { id: string; slug: string };
        error?: string;
        issues?: string[];
      };

      if (!res.ok) {
        const detail =
          data.issues && data.issues.length > 0
            ? data.issues.join(" • ")
            : data.error || "Failed to save trip.";
        setTripFeedback({ type: "error", message: detail });
        setTripSaving(false);
        return;
      }

      if (mode === "create" && data.trip) {
        router.push(`/admin/trips/${data.trip.id}/edit`);
        router.refresh();
        return;
      }

      setTripFeedback({
        type: "success",
        message: "บันทึกข้อมูลทริปเรียบร้อยแล้ว (Trip details saved).",
      });
      router.refresh();
    } catch {
      setTripFeedback({
        type: "error",
        message: "Network error while saving trip.",
      });
    } finally {
      setTripSaving(false);
    }
  }

  function startEditStop(stop: TripStop) {
    setStopFeedback(null);
    setStopForm({
      id: stop.id,
      place_name: stop.place_name,
      description: stop.description,
      latitude: String(stop.latitude),
      longitude: String(stop.longitude),
      image_url: stop.image_url ?? "",
      estimated_minutes:
        stop.estimated_minutes !== null ? String(stop.estimated_minutes) : "",
      suggested_arrival_time: stop.suggested_arrival_time ?? "",
      estimated_cost:
        stop.estimated_cost !== null ? String(stop.estimated_cost) : "",
      notes: stop.notes ?? "",
    });
  }

  function resetStopForm() {
    setStopForm(EMPTY_STOP_FORM);
  }

  async function handleSaveStop(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!initialTrip) return;
    setStopFeedback(null);

    if (!stopFormRef.current?.checkValidity()) {
      return;
    }

    setStopSaving(true);
    try {
      const isEditing = Boolean(stopForm.id);
      const url = isEditing
        ? `/api/admin/trips/${initialTrip.id}/stops/${stopForm.id}`
        : `/api/admin/trips/${initialTrip.id}/stops`;
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        place_name: stopForm.place_name,
        description: stopForm.description,
        latitude: Number(stopForm.latitude),
        longitude: Number(stopForm.longitude),
        image_url: stopForm.image_url || null,
        estimated_minutes: null,
        suggested_arrival_time: null,
        estimated_cost:
          stopForm.estimated_cost !== "" ? Number(stopForm.estimated_cost) : null,
        notes: stopForm.notes || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        stop?: TripStop;
        error?: string;
        issues?: string[];
      };

      if (!res.ok || !data.stop) {
        const detail =
          data.issues && data.issues.length > 0
            ? data.issues.join(" • ")
            : data.error || "Failed to save stop.";
        setStopFeedback({ type: "error", message: detail });
        setStopSaving(false);
        return;
      }

      if (isEditing) {
        setStops((prev) =>
          prev
            .map((s) => (s.id === data.stop!.id ? data.stop! : s))
            .sort((a, b) => a.sequence - b.sequence)
        );
        setStopFeedback({
          type: "success",
          message: `อัปเดตจุดแวะ "${data.stop.place_name}" เรียบร้อย!`,
        });
      } else {
        setStops((prev) =>
          [...prev, data.stop!].sort((a, b) => a.sequence - b.sequence)
        );
        setStopFeedback({
          type: "success",
          message: `เพิ่มจุดแวะที่ #${data.stop.sequence}: "${data.stop.place_name}" เรียบร้อย!`,
        });
      }

      resetStopForm();
      router.refresh();
    } catch {
      setStopFeedback({
        type: "error",
        message: "Network error while saving stop.",
      });
    } finally {
      setStopSaving(false);
    }
  }

  function requestDeleteStop(stop: TripStop) {
    setStopToDelete(stop);
  }

  async function confirmDeleteStop() {
    if (!initialTrip || !stopToDelete) return;
    const stop = stopToDelete;
    setStopToDelete(null);

    setStopSaving(true);
    setStopFeedback(null);
    try {
      const res = await fetch(
        `/api/admin/trips/${initialTrip.id}/stops/${stop.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        setStopFeedback({ type: "error", message: "Failed to delete stop." });
      } else {
        const remaining = stops
          .filter((s) => s.id !== stop.id)
          .sort((a, b) => a.sequence - b.sequence)
          .map((s, idx) => ({ ...s, sequence: idx + 1 }));
        setStops(remaining);
        if (stopForm.id === stop.id) {
          resetStopForm();
        }
        setStopFeedback({
          type: "success",
          message: `ลบ "${stop.place_name}" และเรียงลำดับใหม่เรียบร้อยแล้ว`,
        });
        router.refresh();
      }
    } catch {
      setStopFeedback({
        type: "error",
        message: "Network error while deleting stop.",
      });
    } finally {
      setStopSaving(false);
    }
  }

  async function handleMoveStop(index: number, direction: -1 | 1) {
    if (!initialTrip) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    const reordered = [...stops];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedStopIds = reordered.map((s) => s.id);
    setStopSaving(true);
    setStopFeedback(null);

    try {
      const res = await fetch(`/api/admin/trips/${initialTrip.id}/stops`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedStopIds }),
      });

      const data = (await res.json()) as { stops?: TripStop[]; error?: string };
      if (!res.ok || !data.stops) {
        setStopFeedback({
          type: "error",
          message: data.error || "Failed to reorder stops.",
        });
      } else {
        setStops(data.stops);
        setStopFeedback({
          type: "success",
          message: `อัปเดตลำดับจุดแวะเรียบร้อยแล้ว!`,
        });
        router.refresh();
      }
    } catch {
      setStopFeedback({
        type: "error",
        message: "Network error while reordering stops.",
      });
    } finally {
      setStopSaving(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-sage)]/70 bg-white px-3.5 py-2 text-xs font-semibold text-[var(--color-brand-deep)] shadow-sm transition hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-accent-aqua)]/10"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          กลับหน้าจัดการทริป (Admin Dashboard)
        </Link>

        {mode === "edit" && initialTrip && (
          <Link
            href={`/trips/${slug || initialTrip.slug}?preview=1`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--color-peach)] to-[var(--color-sun-yellow-light)] px-4 py-2 text-xs font-bold text-[var(--color-brand-deep)] shadow-sm transition hover:opacity-95"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            <span>ดูตัวอย่างหน้าทริป (Preview)</span>
          </Link>
        )}
      </div>

      {/* Trip Metadata Form */}
      <div className="rounded-3xl border border-[var(--color-sage)]/70 bg-white/95 p-6 shadow-md shadow-[var(--color-brand-primary)]/5 sm:p-8">
        <h1 className="font-heading text-xl font-extrabold text-[var(--color-brand-deep)]">
          {mode === "create"
            ? "สร้างทริปใหม่ (Create New Curated Trip)"
            : `แก้ไขทริป: ${initialTrip?.title}`}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {mode === "create"
            ? "ขั้นตอนที่ 1: กรอกรายละเอียดหลักของทริปด้านล่าง แล้วกดบันทึกเพื่อไปเพิ่มจุดแวะต่อ"
            : "ปรับแก้ข้อมูลทริป สถานะการเผยแพร่ และลำดับจุดแวะด้านล่างได้เลย"}
        </p>

        {tripFeedback && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-4 flex items-center gap-2 rounded-2xl border p-4 text-xs font-semibold ${
              tripFeedback.type === "success"
                ? "border-[var(--color-brand-primary)]/40 bg-[var(--color-accent-aqua)]/15 text-[var(--color-brand-teal-darkest)]"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {tripFeedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{tripFeedback.message}</span>
          </div>
        )}

        <form ref={tripFormRef} onSubmit={handleSaveTrip} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="trip-title" className={labelClass}>
                ชื่อทริป (Trip Title) <span className="text-red-600">*</span>
              </label>
              <input
                id="trip-title"
                name="title"
                type="text"
                required
                minLength={3}
                maxLength={140}
                aria-errormessage="trip-title-err"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น วันเดียวเที่ยวเมืองเก่าสงขลา"
                className={inputClass}
              />
              <div id="trip-title-err" className="field-error-msg">
                <span aria-hidden="true">❌</span> กรุณากรอกชื่อทริป (อย่างน้อย 3 ตัวอักษร)
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="trip-slug" className={labelClass}>
                  URL Slug (ภาษาอังกฤษตัวพิมพ์เล็ก) <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-primary)] hover:underline"
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  สร้างจากชื่อภาษาอังกฤษ
                </button>
              </div>
              <input
                id="trip-slug"
                name="slug"
                type="text"
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                aria-errormessage="trip-slug-err"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="songkhla-old-town-walk"
                className={`${inputClass} font-mono`}
              />
              <div id="trip-slug-err" className="field-error-msg">
                <span aria-hidden="true">❌</span> ใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข และขีดกลาง (-) เท่านั้น
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="trip-short-desc" className={labelClass}>
              คำโปรยสั้นๆ บนการ์ด (Short Summary) <span className="text-red-600">*</span>
            </label>
            <input
              id="trip-short-desc"
              name="short_description"
              type="text"
              required
              minLength={10}
              maxLength={280}
              aria-errormessage="trip-short-desc-err"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="สรุปสั้นๆ 1–2 ประโยคให้คนอยากกดเข้ามาดูรูท..."
              className={inputClass}
            />
            <div id="trip-short-desc-err" className="field-error-msg">
              <span aria-hidden="true">❌</span> กรุณากรอกคำโปรยสั้นๆ (10–280 ตัวอักษร)
            </div>
          </div>

          <div>
            <label htmlFor="trip-desc" className={labelClass}>
              รายละเอียดทริปแบบเต็ม (Full Overview) <span className="text-red-600">*</span>
            </label>
            <textarea
              id="trip-desc"
              name="description"
              required
              minLength={20}
              rows={4}
              aria-errormessage="trip-desc-err"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เล่าภาพรวมของรูทนี้ เหมาะกับใคร เริ่มกี่โมงดี มีทริคอะไรบ้าง..."
              className={textareaClass}
            />
            <div id="trip-desc-err" className="field-error-msg">
              <span aria-hidden="true">❌</span> กรุณากรอกรายละเอียดทริป (อย่างน้อย 20 ตัวอักษร)
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="trip-province" className={labelClass}>
                จังหวัด (Province) <span className="text-red-600">*</span>
              </label>
              <input
                id="trip-province"
                name="province"
                type="text"
                required
                aria-errormessage="trip-province-err"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="เช่น Bangkok, Chiang Mai, เชียงใหม่"
                className={inputClass}
              />
              <div id="trip-province-err" className="field-error-msg">
                <span aria-hidden="true">❌</span> กรุณาระบุจังหวัด
              </div>
            </div>

            <div>
              <label htmlFor="trip-category" className={labelClass}>
                สไตล์ทริป (Category) <span className="text-red-600">*</span>
              </label>
              <input
                id="trip-category"
                name="category"
                type="text"
                required
                aria-errormessage="trip-category-err"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="เช่น คาเฟ่ & เมืองเก่า, ขับรถชมวิว"
                className={inputClass}
              />
              <div id="trip-category-err" className="field-error-msg">
                <span aria-hidden="true">❌</span> กรุณาระบุหมวดหมู่
              </div>
            </div>

            <div>
              <label htmlFor="trip-travel-mode" className={labelClass}>
                วิธีเดินทางหลัก (Travel Mode) <span className="text-red-600">*</span>
              </label>
              <div className="mt-1.5">
                <CustomDropdown
                  id="trip-travel-mode"
                  name="travel_mode"
                  value={travelMode || "driving"}
                  onChange={(v) => setTravelMode(v as TravelMode)}
                  options={TRAVEL_MODE_OPTIONS}
                  ariaLabel="Travel Mode"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="trip-duration-label" className={labelClass}>
                ป้ายระยะเวลา <span className="text-red-600">*</span>
              </label>
              <input
                id="trip-duration-label"
                name="duration_label"
                type="text"
                required
                aria-errormessage="trip-duration-err"
                value={durationLabel}
                onChange={(e) => setDurationLabel(e.target.value)}
                placeholder="เช่น ครึ่งวัน (5 ชม.)"
                className={inputClass}
              />
              <div id="trip-duration-err" className="field-error-msg">
                <span aria-hidden="true">❌</span> กรุณาระบุระยะเวลา
              </div>
            </div>

            <div>
              <label htmlFor="trip-duration-hours" className={labelClass}>
                จำนวนชั่วโมง (ชม.)
              </label>
              <input
                id="trip-duration-hours"
                name="duration_hours"
                type="number"
                step="0.5"
                min="0.5"
                max="720"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                placeholder="เช่น 5"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="trip-budget-min" className={labelClass}>
                งบต่ำสุด (฿)
              </label>
              <input
                id="trip-budget-min"
                name="budget_min"
                type="number"
                min="0"
                step="50"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="เช่น 300"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="trip-budget-max" className={labelClass}>
                งบสูงสุด (฿)
              </label>
              <input
                id="trip-budget-max"
                name="budget_max"
                type="number"
                min="0"
                step="50"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="เช่น 1000"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <ImageUploadField
                label="รูปปกทริป (Cover Image)"
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                aspectRatio="aspect-[16/10]"
                helperText="เว้นว่างไว้เพื่อใช้ Placeholder ได้ หรืออัปโหลดรูปภาพใหม่ (ย่อไฟล์คมชัดอัตโนมัติ)"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="trip-status" className={labelClass}>
                  สถานะการเผยแพร่
                </label>
                <div className="mt-1.5">
                  <CustomDropdown
                    id="trip-status"
                    name="status"
                    value={status}
                    onChange={(v) => setStatus(v as TripStatus)}
                    options={STATUS_OPTIONS}
                    ariaLabel="Publication Status"
                  />
                </div>
              </div>

              <div className="flex items-end pb-2.5">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--color-brand-deep)]">
                  <input
                    type="checkbox"
                    checked={isSample}
                    onChange={(e) => setIsSample(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-sage)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                  />
                  <span>ติดป้ายว่าเป็นทริปตัวอย่าง</span>
                </label>
              </div>
            </div>
          </div>

          {/* Optional Trip Header Location Pinning for Single-Place Review or Starting Point */}
          <div className="rounded-2xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] p-4 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[var(--color-brand-primary)]" />
                <span className={labelClass}>
                  ปักหมุดพิกัดสถานที่หลัก (Trip Header Location) — ไม่บังคับ (Optional)
                </span>
                <span className="rounded-full border border-teal-300 bg-teal-100/70 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  Optional
                </span>
              </div>
              {(headerLat || headerLng || locationName) && (
                <button
                  type="button"
                  onClick={() => {
                    setHeaderLat("");
                    setHeaderLng("");
                    setLocationName("");
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 underline"
                >
                  ล้างหมุด (ไม่ปักหมุด)
                </button>
              )}
            </div>
            <p className="mb-3 text-xs text-slate-500">
              สำหรับรีวิวสถานที่เดียว (เช่น คาเฟ่, ร้านอาหาร) ที่ไม่มีจุดแวะย่อย หรือจุดนัดพบเริ่มต้น เพื่อให้ระบบแสดงแผนที่และปุ่มนำทาง Google Maps
            </p>

            <div className="mb-3">
              <label htmlFor="trip-location-name" className={labelClass}>
                ชื่อสถานที่ / หมุดแผนที่ (Location / Place Name)
              </label>
              <input
                id="trip-location-name"
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="เช่น Shibainu Story หรือชื่อร้าน/สถานที่"
                className={inputClass}
              />
            </div>

            <LocationPickerMap
              latitude={headerLat ? Number(headerLat) : null}
              longitude={headerLng ? Number(headerLng) : null}
              placeName={locationName || title}
              onChange={(lat, lng) => {
                setHeaderLat(String(lat));
                setHeaderLng(String(lng));
              }}
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="trip-header-lat" className={labelClass}>
                  Latitude (-90 ถึง 90)
                </label>
                <input
                  id="trip-header-lat"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={headerLat}
                  onChange={(e) => setHeaderLat(e.target.value)}
                  placeholder="เช่น 13.7563"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label htmlFor="trip-header-lng" className={labelClass}>
                  Longitude (-180 ถึง 180)
                </label>
                <input
                  id="trip-header-lng"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={headerLng}
                  onChange={(e) => setHeaderLng(e.target.value)}
                  placeholder="เช่น 100.5018"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--color-sage)]/40 pt-4">
            <button
              type="submit"
              disabled={tripSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-accent-aqua)] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[var(--color-brand-primary)]/20 transition hover:opacity-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>
                {tripSaving
                  ? "กำลังบันทึก..."
                  : mode === "create"
                    ? "สร้างทริป & ไปเพิ่มจุดแวะต่อ"
                    : "บันทึกข้อมูลทริป"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Stop Management Section (Edit Mode) */}
      {mode === "edit" && initialTrip && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Ordered Stops List & Reorder Controls */}
          <div className="rounded-3xl border border-[var(--color-sage)]/70 bg-white/95 p-6 shadow-sm lg:col-span-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-extrabold text-[var(--color-brand-deep)]">
                  รายการจุดแวะตามลำดับ ({stops.length} จุด)
                </h2>
                <p className="text-xs text-slate-500">
                  กดลูกศรขึ้น/ลงเพื่อสลับลำดับจุดแวะ (1 &rarr; {stops.length || 1})
                </p>
              </div>
              {stopForm.id && (
                <button
                  type="button"
                  onClick={resetStopForm}
                  className="inline-flex items-center rounded-xl bg-[var(--color-sage)]/25 px-3 py-1.5 text-xs font-semibold text-[var(--color-brand-deep)] transition hover:bg-[var(--color-accent-aqua)]/20"
                >
                  + สลับไปโหมดเพิ่มจุดแวะใหม่
                </button>
              )}
            </div>

            {stopFeedback && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-4 rounded-2xl border p-4 text-xs font-semibold ${
                  stopFeedback.type === "success"
                    ? "border-[var(--color-brand-primary)]/40 bg-[var(--color-accent-aqua)]/15 text-[var(--color-brand-teal-darkest)]"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {stopFeedback.message}
              </div>
            )}

            {stops.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-sage)] p-8 text-center">
                <MapPin
                  className="mx-auto h-8 w-8 text-[var(--color-brand-primary)]/60"
                  aria-hidden="true"
                />
                <p className="mt-2 text-sm font-semibold text-[var(--color-brand-deep)]">
                  ยังไม่มีจุดแวะในทริปนี้
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  กรอกฟอร์มด้านขวามือเพื่อเพิ่มจุดแวะที่ #1 พร้อมพิกัดได้เลย
                </p>
              </div>
            ) : (
              <ol className="mt-5 space-y-3">
                {stops.map((stop, idx) => (
                  <li
                    key={stop.id}
                    className={`rounded-2xl border p-4 transition ${
                      stopForm.id === stop.id
                        ? "border-2 border-[var(--color-brand-primary)] bg-[var(--color-accent-aqua)]/10"
                        : "border-[var(--color-sage)]/60 bg-[var(--color-sage)]/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent-aqua)] to-[var(--color-brand-primary)] font-heading text-xs font-extrabold text-white">
                          {stop.sequence}
                        </span>
                        <div>
                          <h3 className="font-heading text-sm font-bold text-[var(--color-brand-deep)]">
                            {stop.place_name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {stop.description}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span className="font-mono font-semibold text-[var(--color-brand-primary)]">
                              {formatCoordinatePair(stop.latitude, stop.longitude, 5)}
                            </span>
                            {stop.estimated_cost !== null && (
                              <span>฿{stop.estimated_cost}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0 || stopSaving}
                          onClick={() => handleMoveStop(idx, -1)}
                          aria-label={`Move ${stop.place_name} up`}
                          title="เลื่อนขึ้น"
                          className="rounded-lg border border-[var(--color-sage)] bg-white p-1.5 text-[var(--color-brand-deep)] hover:bg-[var(--color-accent-aqua)]/15 disabled:opacity-40"
                        >
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === stops.length - 1 || stopSaving}
                          onClick={() => handleMoveStop(idx, 1)}
                          aria-label={`Move ${stop.place_name} down`}
                          title="เลื่อนลง"
                          className="rounded-lg border border-[var(--color-sage)] bg-white p-1.5 text-[var(--color-brand-deep)] hover:bg-[var(--color-accent-aqua)]/15 disabled:opacity-40"
                        >
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditStop(stop)}
                          aria-label={`Edit ${stop.place_name}`}
                          className="rounded-lg border border-[var(--color-sage)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--color-brand-deep)] hover:bg-[var(--color-accent-aqua)]/15"
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={stopSaving}
                          onClick={() => requestDeleteStop(stop)}
                          aria-label={`Delete ${stop.place_name}`}
                          className="rounded-lg border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Right: Add / Edit Stop Form */}
          <div className="rounded-3xl border border-[var(--color-sage)]/70 bg-white/95 p-6 shadow-sm lg:col-span-5">
            <h2 className="font-heading text-lg font-extrabold text-[var(--color-brand-deep)]">
              {stopForm.id
                ? `แก้ไขจุดแวะ: ${stopForm.place_name}`
                : `เพิ่มจุดแวะที่ #${stops.length + 1}`}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              ระบุพิกัด Latitude [-90, 90] และ Longitude [-180, 180] ได้โดยตรง
            </p>

            <form
              ref={stopFormRef}
              onSubmit={handleSaveStop}
              className="mt-4 space-y-3.5"
            >
              <div>
                <label htmlFor="stop-place-name" className={labelClass}>
                  ชื่อสถานที่ (Place Name) <span className="text-red-600">*</span>
                </label>
                <input
                  id="stop-place-name"
                  name="place_name"
                  type="text"
                  required
                  minLength={2}
                  aria-errormessage="stop-name-err"
                  value={stopForm.place_name}
                  onChange={(e) =>
                    setStopForm((s) => ({ ...s, place_name: e.target.value }))
                  }
                  placeholder="เช่น ท่าเรือวัดอรุณฯ"
                  className={inputClass}
                />
                <div id="stop-name-err" className="field-error-msg">
                  <span aria-hidden="true">❌</span> กรุณาระบุชื่อสถานที่
                </div>
              </div>

              <div>
                <label htmlFor="stop-desc" className={labelClass}>
                  รายละเอียดจุดแวะ <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="stop-desc"
                  name="description"
                  required
                  minLength={5}
                  rows={3}
                  aria-errormessage="stop-desc-err"
                  value={stopForm.description}
                  onChange={(e) =>
                    setStopForm((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder="จุดนี้มีไฮไลต์อะไร แวะทำอะไรดี..."
                  className={textareaClass}
                />
                <div id="stop-desc-err" className="field-error-msg">
                  <span aria-hidden="true">❌</span> กรุณากรอกรายละเอียดจุดแวะ
                </div>
              </div>

              {/* Stop Map Pinning Picker */}
              <div className="rounded-2xl border-2 border-teal-200 bg-teal-50/40 p-3 sm:p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[var(--color-brand-primary)]" />
                    <span>ปักหมุดตำแหน่งจุดแวะในแผนที่ (Map Pinning)</span>
                  </span>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                    ค้นหาหรือคลิกบนแผนที่
                  </span>
                </div>
                <LocationPickerMap
                  latitude={stopForm.latitude ? Number(stopForm.latitude) : null}
                  longitude={stopForm.longitude ? Number(stopForm.longitude) : null}
                  placeName={stopForm.place_name}
                  onChange={(lat, lng) => {
                    setStopForm((s) => ({
                      ...s,
                      latitude: String(lat),
                      longitude: String(lng),
                    }));
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="stop-lat" className={labelClass}>
                    Latitude (-90 ถึง 90) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="stop-lat"
                    name="latitude"
                    type="number"
                    required
                    step="any"
                    min="-90"
                    max="90"
                    aria-errormessage="stop-lat-err"
                    value={stopForm.latitude}
                    onChange={(e) =>
                      setStopForm((s) => ({ ...s, latitude: e.target.value }))
                    }
                    placeholder="13.7437"
                    className={`${inputClass} font-mono`}
                  />
                  <div id="stop-lat-err" className="field-error-msg">
                    <span aria-hidden="true">❌</span> ค่า Latitude ต้องอยู่ระหว่าง -90 ถึง 90
                  </div>
                </div>

                <div>
                  <label htmlFor="stop-lng" className={labelClass}>
                    Longitude (-180 ถึง 180) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="stop-lng"
                    name="longitude"
                    type="number"
                    required
                    step="any"
                    min="-180"
                    max="180"
                    aria-errormessage="stop-lng-err"
                    value={stopForm.longitude}
                    onChange={(e) =>
                      setStopForm((s) => ({ ...s, longitude: e.target.value }))
                    }
                    placeholder="100.4889"
                    className={`${inputClass} font-mono`}
                  />
                  <div id="stop-lng-err" className="field-error-msg">
                    <span aria-hidden="true">❌</span> ค่า Longitude ต้องอยู่ระหว่าง -180 ถึง 180
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="stop-cost" className={labelClass}>
                  ค่าใช้จ่ายประมาณการ (฿) (ไม่บังคับ)
                </label>
                <input
                  id="stop-cost"
                  type="number"
                  min="0"
                  step="10"
                  value={stopForm.estimated_cost}
                  onChange={(e) =>
                    setStopForm((s) => ({
                      ...s,
                      estimated_cost: e.target.value,
                    }))
                  }
                  placeholder="เช่น 100"
                  className={inputClass}
                />
              </div>

              <div>
                <MultiImageUploadField
                  images={
                    stopForm.image_url
                      ? stopForm.image_url
                          .split(/[\n,;]+/)
                          .map((u) => u.trim())
                          .filter(Boolean)
                      : []
                  }
                  onChange={(newImages) =>
                    setStopForm((s) => ({
                      ...s,
                      image_url: newImages.join("\n"),
                    }))
                  }
                  label="รูปถ่ายจุดแวะ (Stop Photos)"
                  helperText="สามารถอัปโหลดได้หลายรูป (ครอบตัด 3:4 และย่อขนาด Full HD ให้อัตโนมัติ)"
                  title={stopForm.place_name || "จุดแวะ"}
                  province={province || "ประเทศไทย"}
                />
              </div>

              <div>
                <label htmlFor="stop-notes" className={labelClass}>
                  หมายเหตุ / ทิปเพิ่มเติม (ไม่บังคับ)
                </label>
                <input
                  id="stop-notes"
                  type="text"
                  value={stopForm.notes}
                  onChange={(e) =>
                    setStopForm((s) => ({ ...s, notes: e.target.value }))
                  }
                  placeholder="เช่น ที่จอดรถ การแต่งกาย วันหยุด..."
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {stopForm.id && (
                  <button
                    type="button"
                    onClick={resetStopForm}
                    className="inline-flex items-center rounded-xl border border-[var(--color-sage)]/70 bg-white px-3.5 py-2 text-xs font-semibold text-[var(--color-brand-deep)] shadow-sm transition hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-accent-aqua)]/10"
                  >
                    ยกเลิกการแก้ไข
                  </button>
                )}
                <button
                  type="submit"
                  disabled={stopSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-accent-aqua)] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[var(--color-brand-primary)]/20 transition hover:opacity-95 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {stopSaving
                      ? "กำลังบันทึก..."
                      : stopForm.id
                        ? "อัปเดตจุดแวะ"
                        : `เพิ่มจุดแวะที่ #${stops.length + 1}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {stopToDelete && (
        <ConfirmModal
          isOpen={true}
          title="ยืนยันการลบจุดแวะ"
          description={`คุณแน่ใจหรือไม่ว่าต้องการลบจุดแวะ #${stopToDelete.sequence} "${stopToDelete.place_name}" ออกจากแผนการเดินทางนี้?`}
          confirmText="ลบจุดแวะ"
          cancelText="ยกเลิก"
          variant="danger"
          onConfirm={confirmDeleteStop}
          onCancel={() => setStopToDelete(null)}
        />
      )}
    </div>
  );
}
