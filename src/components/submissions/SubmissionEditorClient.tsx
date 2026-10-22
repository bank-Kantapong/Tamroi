"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Car,
  Footprints,
  Train,
  Bike,
  Compass,
  Clock,
  DollarSign,
  MapPin,
  Save,
  Send,
  CheckCircle2,
} from "lucide-react";
import type { TravelMode, TripWithStops } from "@/types/trip";
import { useLanguage } from "@/components/LanguageProvider";
import {
  MultiImageUploadField,
  ProvinceSearchSelect,
} from "@/components/common";
import { PaperPlaneDoodle } from "@/components/illustrations";

// Dynamically import LocationPickerMap (Leaflet requires window object)
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

interface StopInputItem {
  id?: string;
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

interface SubmissionEditorClientProps {
  mode: "create" | "edit";
  initialTrip?: TripWithStops;
}

export function SubmissionEditorClient({
  mode,
  initialTrip,
}: SubmissionEditorClientProps) {
  const { t } = useLanguage();
  const router = useRouter();

  // Trip Form State
  const [title, setTitle] = useState(initialTrip?.title || "");
  const [shortDescription, setShortDescription] = useState(
    initialTrip?.short_description || ""
  );
  const [description, setDescription] = useState(initialTrip?.description || "");

  // Multiple Cover / Trip Photos (newline-separated in storage)
  const [coverImages, setCoverImages] = useState<string[]>(() => {
    if (initialTrip?.cover_image_url) {
      return initialTrip.cover_image_url
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  });

  const [province, setProvince] = useState(initialTrip?.province || "");
  const [category, setCategory] = useState(initialTrip?.category || "");
  const [durationLabel, setDurationLabel] = useState(
    initialTrip?.duration_label || "1 Day"
  );
  const [durationHours, setDurationHours] = useState(
    initialTrip?.duration_hours ? String(initialTrip.duration_hours) : ""
  );

  // Single Budget Field (THB per person)
  const [budget, setBudget] = useState<string>(() => {
    if (initialTrip?.budget_max !== null && initialTrip?.budget_max !== undefined) {
      return String(initialTrip.budget_max);
    }
    if (initialTrip?.budget_min !== null && initialTrip?.budget_min !== undefined) {
      return String(initialTrip.budget_min);
    }
    return "";
  });

  // Optional Travel Mode & Custom "Other" Note
  const [travelMode, setTravelMode] = useState<TravelMode>(
    initialTrip?.travel_mode ?? null
  );
  const [travelModeNote, setTravelModeNote] = useState<string>(
    initialTrip?.travel_mode_note || ""
  );

  // Stops State
  const [stops, setStops] = useState<StopInputItem[]>(() => {
    if (initialTrip?.stops && initialTrip.stops.length > 0) {
      return [...initialTrip.stops]
        .sort((a, b) => a.sequence - b.sequence)
        .map((s) => ({
          id: s.id,
          place_name: s.place_name,
          description: s.description,
          latitude: String(s.latitude),
          longitude: String(s.longitude),
          image_url: s.image_url || "",
          estimated_minutes:
            s.estimated_minutes !== null ? String(s.estimated_minutes) : "",
          suggested_arrival_time: s.suggested_arrival_time || "",
          estimated_cost:
            s.estimated_cost !== null ? String(s.estimated_cost) : "",
          notes: s.notes || "",
        }));
    }
    return [
      {
        place_name: "",
        description: "",
        latitude: "",
        longitude: "",
        image_url: "",
        estimated_minutes: "",
        suggested_arrival_time: "",
        estimated_cost: "",
        notes: "",
      },
    ];
  });


  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculated stats for live preview matching TripHeaderStats
  const totalStopCost = stops.reduce((sum, s) => {
    const cost = Number(s.estimated_cost);
    return !isNaN(cost) && cost > 0 ? sum + cost : sum;
  }, 0);

  function addStop() {
    setStops((prev) => [
      ...prev,
      {
        place_name: "",
        description: "",
        latitude: "",
        longitude: "",
        image_url: "",
        estimated_minutes: "",
        suggested_arrival_time: "",
        estimated_cost: "",
        notes: "",
      },
    ]);
  }

  function removeStop(index: number) {
    if (stops.length <= 1) {
      setError("ทริปต้องมีจุดแวะอย่างน้อย 1 จุด");
      return;
    }
    setStops((prev) => prev.filter((_, i) => i !== index));
  }

  function moveStop(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    setStops((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  }

  function updateStopField(
    index: number,
    field: keyof StopInputItem,
    value: string
  ) {
    setStops((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }


  async function handleSubmit(targetStatus: "draft" | "pending_review") {
    setError(null);
    setSuccessToast(null);

    // If submitting for review, enforce strict validation
    if (targetStatus === "pending_review") {
      if (title.trim().length < 3) {
        setError("กรุณากรอกชื่อทริปอย่างน้อย 3 ตัวอักษร");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (shortDescription.trim().length < 10) {
        setError("กรุณากรอกคำอธิบายย่ออย่างน้อย 10 ตัวอักษร");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (description.trim().length < 20) {
        setError("กรุณากรอกคำอธิบายทริปฉบับเต็มอย่างน้อย 20 ตัวอักษร");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!province.trim()) {
        setError("กรุณาเลือกหรือระบุจังหวัดที่ท่องเที่ยว");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!category.trim()) {
        setError("กรุณาระบุสไตล์ทริปหรือหมวดหมู่");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Validate stops for review submission
      if (stops.length === 0) {
        setError("ทริปต้องมีจุดแวะอย่างน้อย 1 จุด");
        return;
      }
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        if (s.place_name.trim().length < 2) {
          setError(`จุดแวะที่ ${i + 1}: กรุณากรอกชื่อสถานที่อย่างน้อย 2 ตัวอักษร`);
          return;
        }
        if (s.description.trim().length < 5) {
          setError(`จุดแวะที่ ${i + 1}: กรุณากรอกคำอธิบายจุดแวะอย่างน้อย 5 ตัวอักษร`);
          return;
        }
        const lat = Number(s.latitude);
        const lng = Number(s.longitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          setError(
            `จุดแวะที่ ${i + 1}: กรุณาปักหมุดบนแผนที่ หรือกรอกละติจูด (Latitude) ระหว่าง -90 ถึง 90`
          );
          return;
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          setError(
            `จุดแวะที่ ${i + 1}: กรุณาปักหมุดบนแผนที่ หรือกรอกลองจิจูด (Longitude) ระหว่าง -180 ถึง 180`
          );
          return;
        }
      }
    }

    // When targetStatus === "draft":
    // Bypass all validations completely and provide safe fallbacks for empty fields
    setIsSubmitting(true);

    const isDraft = targetStatus === "draft";
    const budgetNum = budget && !isNaN(Number(budget)) ? Number(budget) : null;

    // Join multiple cover images with newline for storage
    const coverImageUrl = coverImages.length > 0 ? coverImages.join("\n") : null;

    const payload = {
      title: isDraft ? title.trim() || "แบบร่างทริปใหม่" : title.trim(),
      short_description: isDraft
        ? shortDescription.trim() || "แบบร่างทริป (ยังไม่ได้ระบุคำอธิบายย่อ)"
        : shortDescription.trim(),
      description: isDraft
        ? description.trim() || "แบบร่างทริปที่ยังเขียนไม่เสร็จ"
        : description.trim(),
      cover_image_url: coverImageUrl,
      province: isDraft ? province.trim() || "ไม่ระบุ" : province.trim(),
      category: isDraft ? category.trim() || "ทั่วไป" : category.trim(),
      duration_label: isDraft
        ? durationLabel.trim() || "1 Day"
        : durationLabel.trim(),
      duration_hours: durationHours ? Number(durationHours) : null,
      budget_min: budgetNum,
      budget_max: budgetNum,
      travel_mode: travelMode,
      travel_mode_note: travelMode === "other" ? travelModeNote.trim() || null : null,
      status: targetStatus,
      stops:
        stops.length > 0
          ? stops.map((s, idx) => {
              const rawName = s.place_name.trim();
              const placeName = isDraft
                ? rawName.length >= 2
                  ? rawName
                  : rawName.length === 1
                  ? `${rawName}..`
                  : `จุดแวะที่ ${idx + 1}`
                : rawName;

              const rawDesc = s.description.trim();
              const desc = isDraft
                ? rawDesc.length >= 5
                  ? rawDesc
                  : rawDesc.length > 0
                  ? `${rawDesc}.....`
                  : "คำอธิบายจุดแวะแบบร่าง"
                : rawDesc;

              const latNum = Number(s.latitude);
              const lngNum = Number(s.longitude);
              const lat = isDraft
                ? Number.isFinite(latNum) && latNum >= -90 && latNum <= 90
                  ? latNum
                  : 13.7563
                : latNum;
              const lng = isDraft
                ? Number.isFinite(lngNum) && lngNum >= -180 && lngNum <= 180
                  ? lngNum
                  : 100.5018
                : lngNum;

              return {
                place_name: placeName,
                description: desc,
                latitude: lat,
                longitude: lng,
                sequence: idx + 1,
                image_url: s.image_url.trim() || null,
                estimated_minutes: null,
                suggested_arrival_time: null,
                estimated_cost: s.estimated_cost
                  ? Number(s.estimated_cost)
                  : null,
                notes: s.notes.trim() || null,
              };
            })
          : [
              {
                place_name: "จุดแวะเริ่มต้น",
                description: "จุดแวะแบบร่าง",
                latitude: 13.7563,
                longitude: 100.5018,
                sequence: 1,
                image_url: null,
                estimated_minutes: null,
                suggested_arrival_time: null,
                estimated_cost: null,
                notes: null,
              },
            ],
    };

    try {
      const url =
        mode === "edit" && initialTrip
          ? `/api/submissions/${initialTrip.id}`
          : "/api/submissions";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        if (isDraft) {
          setSuccessToast("บันทึกแบบร่างสำเร็จแล้ว! คุณสามารถแก้ไขต่อได้ตลอดเวลา");
          setTimeout(() => {
            router.push("/submissions");
            router.refresh();
          }, 800);
        } else {
          router.push("/submissions");
          router.refresh();
        }
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="cute-page-container py-8 sm:py-12">
      {/* Top Nav Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/submissions"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[var(--color-brand-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.submissions.title}</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-brand-cyan)] bg-[var(--color-bg-aqua-fade)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand-teal-deep)]">
          <Compass className="h-3.5 w-3.5" />
          <span>โครงสร้างเดียวกับหน้าแสดงผลจริง (Preview Layout)</span>
        </span>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-black text-[var(--color-brand-deep)] sm:text-3xl">
          {mode === "edit"
            ? t.submissions.editorTitleEdit
            : t.submissions.editorTitleNew}
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-600">
          อัปโหลดรูปภาพครอบตัด 3:4 ปักหมุดพิกัดบนแผนที่ และบันทึกแบบร่างได้ตลอดเวลา
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2.5 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-800 animate-fade-up shadow-sm"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div
          role="status"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-xs font-black text-emerald-800 animate-fade-up shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}


      <div className="space-y-8">
        {/* ========================================================================= */}
        {/* SECTION 1: SCRAPBOOK HEADER CARD (Mirrors TripScrapbookHeader 1:1)       */}
        {/* ========================================================================= */}
        <div className="animate-fade-up relative scrapbook-header-card border-2 border-[var(--color-border-card)]">
          {/* Top-right Paper Plane Doodle */}
          <PaperPlaneDoodle className="pointer-events-none absolute -top-3 right-3 hidden h-20 w-40 select-none sm:block" />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            {/* LEFT COLUMN: Multi-Photo Upload with 3:4 Crop and Preview */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-4 shadow-inner">
                <MultiImageUploadField
                  images={coverImages}
                  onChange={setCoverImages}
                  title={title || "พรีวิวรูปทริป"}
                  province={province || "ประเทศไทย"}
                  label="รูปภาพหน้าปกทริป (Cover & Gallery Photos)"
                  helperText="อัปโหลดได้หลายรูป หลายครั้ง พร้อมระบบครอบตัด 3:4 และย่อขนาด Full HD"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Meta, Title, Descriptions, and Live Stats */}
            <div className="flex flex-col p-1 sm:p-2 lg:p-3 lg:col-span-7 space-y-4">
              <div>
                {/* Meta Badges Row: Category, Searchable Province, Optional Travel Mode */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Category Input */}
                    <div>
                      <label className="mb-1 block text-xs font-black text-slate-700">
                        สไตล์ทริป / หมวดหมู่ (Category) *
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="เช่น Cafe & Chill, Culture, Nature"
                        className="cute-input w-full border-2 border-slate-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl text-xs py-2 px-3 font-bold"
                      />
                    </div>

                    {/* Searchable Province Dropdown */}
                    <div>
                      <ProvinceSearchSelect
                        value={province}
                        onChange={setProvince}
                        label="จังหวัด (Province) *"
                        placeholder="เลือกหรือพิมพ์ค้นหาจังหวัดในไทย..."
                      />
                    </div>
                  </div>

                  {/* Optional Travel Mode Pills with "อื่นๆ" */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700">
                        รูปแบบการเดินทาง (Travel Mode)
                        <span className="ml-1 text-[11px] font-normal text-slate-400">
                          (ไม่บังคับเลือก)
                        </span>
                      </label>
                      {travelMode && (
                        <button
                          type="button"
                          onClick={() => {
                            setTravelMode(null);
                            setTravelModeNote("");
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-rose-500"
                        >
                          ล้างตัวเลือก
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {(
                        [
                          { mode: "driving" as const, label: "ขับรถ", icon: Car },
                          { mode: "walking" as const, label: "เดินชิลล์", icon: Footprints },
                          { mode: "transit" as const, label: "รถสาธารณะ", icon: Train },
                          { mode: "bicycling" as const, label: "จักรยาน", icon: Bike },
                          { mode: "other" as const, label: "อื่นๆ", icon: Compass },
                        ] as const
                      ).map(({ mode: m, label, icon: Icon }) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTravelMode(travelMode === m ? null : m)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border-2 p-2 text-xs font-extrabold transition ${
                            travelMode === m
                              ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Explanation Input when "อื่นๆ" is selected */}
                    {travelMode === "other" && (
                      <div className="mt-2 animate-fade-up">
                        <input
                          type="text"
                          value={travelModeNote}
                          onChange={(e) => setTravelModeNote(e.target.value)}
                          placeholder="อธิบายการเดินทางอื่นๆ เช่น นั่งเรือด่วนเจ้าพระยา, นั่งรถไฟ, เช่ามอเตอร์ไซค์..."
                          className="cute-input w-full border-2 border-teal-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl text-xs py-1.5 px-3 font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Big Title Input (Matches Scrapbook h1) */}
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-black text-slate-700">
                    ชื่อทริป (Trip Title) *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น One Day Walk รอบเกาะรัตนโกสินทร์ ถ่ายรูปคาเฟ่ท่าเตียน"
                    className="cute-input w-full border-2 border-slate-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl font-heading text-base sm:text-lg font-black text-[var(--color-brand-deep)] py-2.5 px-3"
                  />
                </div>

                {/* Short Description Input */}
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-black text-slate-700">
                    คำอธิบายแบบย่อ (Short Description) *
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="สรุปทริปสั้นๆ 1-2 ประโยคสำหรับแสดงบนการ์ดหน้าแรก"
                    className="cute-input w-full border-2 border-slate-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl text-xs sm:text-sm font-bold text-[var(--color-brand-tag)] py-2 px-3"
                  />
                </div>

                {/* Full Description Textarea */}
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-black text-slate-700">
                    เรื่องราวทริป / รายละเอียดการเดินทาง (Full Description) *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="เล่าไฮไลท์ จุดเด่น บรรยากาศ หรือข้อแนะนำทั่วไปของทริปนี้เพื่อให้คนเที่ยวตามได้ง่าย..."
                    className="cute-input w-full border-2 border-slate-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl text-xs sm:text-sm font-medium text-slate-700 py-2 px-3"
                  />
                </div>
              </div>

              {/* Live Stat Cards Grid (Mirrors TripHeaderStats 1:1) */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <p className="mb-2 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  สถิติและการคำนวณของทริป (Trip Quick Stats)
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {/* Stat 1: Duration */}
                  <div className="rounded-xl border-2 border-teal-200 bg-teal-50/60 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-brand-teal-light)] mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>เวลาทั้งทริป</span>
                    </div>
                    <input
                      type="text"
                      value={durationLabel}
                      onChange={(e) => setDurationLabel(e.target.value)}
                      placeholder="เช่น 1 Day"
                      className="cute-input w-full border-2 border-teal-300 bg-white rounded-lg text-xs font-bold py-1 px-2"
                    />
                    <div className="mt-1 flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={durationHours}
                        onChange={(e) => setDurationHours(e.target.value)}
                        placeholder="ชม."
                        className="cute-input w-16 border-2 border-teal-300 bg-white rounded-lg text-[11px] font-bold py-0.5 px-1.5"
                      />
                      <span className="text-[10px] text-teal-800 font-bold">ชม. รวม</span>
                    </div>
                  </div>

                  {/* Stat 2: Single Budget Field */}
                  <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 mb-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>งบประมาณ (บาท)</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="เช่น 500"
                      className="cute-input w-full border-2 border-emerald-300 bg-white rounded-lg text-xs font-bold py-1 px-2"
                    />
                    <span className="mt-1 block text-[10px] text-emerald-800 font-semibold">
                      (โดยประมาณต่อคน)
                    </span>
                  </div>

                  {/* Stat 3: Total Stops (Auto-calculated) */}
                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>จุดแวะทั้งหมด</span>
                    </div>
                    <div className="font-heading text-lg font-black text-amber-900 mt-1">
                      {stops.length} จุดแวะ
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold">
                      คำนวณจากรายการจุดแวะ
                    </span>
                  </div>

                  {/* Stat 4: Total Stop Cost (Auto-calculated) */}
                  <div className="rounded-xl border-2 border-rose-200 bg-rose-50/60 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-700">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>รวมค่าจุดแวะ</span>
                    </div>
                    <div className="font-heading text-lg font-black text-rose-900 mt-1">
                      {totalStopCost > 0
                        ? `~฿${totalStopCost.toLocaleString()}`
                        : "ฟรี / ตามสะดวก"}
                    </div>
                    <span className="text-[10px] text-rose-700 font-semibold">
                      รวมจากค่าใช้จ่ายแต่ละจุด
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: ORDERED STOPS LIST WITH MAP PINNING PICKER                     */}
        {/* ========================================================================= */}
        <div className="cute-card p-6 sm:p-8 border-2 border-slate-300 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-heading text-xl font-black text-[var(--color-brand-deep)] flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[var(--color-brand-primary)]" />
                <span>{t.submissions.stopsSection}</span>
              </h2>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                ปักหมุดพิกัดบนแผนที่ ค้นหาชื่อสถานที่ และระบุข้อมูลจุดแวะตามลำดับการเดินทางจริง
              </p>
            </div>

            <button
              type="button"
              onClick={addStop}
              className="cute-btn cute-btn-secondary inline-flex items-center gap-1.5 py-2.5 px-4 text-xs font-black shadow-sm"
            >
              <Plus className="h-4 w-4 text-[var(--color-brand-primary)]" />
              <span>{t.submissions.addStopBtn}</span>
            </button>
          </div>

          {/* List of Stop Cards */}
          <div className="space-y-8">
            {stops.map((stop, idx) => (
              <div
                key={idx}
                className="rounded-2xl border-2 border-slate-300 bg-white p-4 sm:p-6 shadow-sm transition hover:border-[var(--color-brand-primary)]"
              >
                {/* Stop Card Header */}
                <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-sm font-black text-white shadow-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-sm font-black text-slate-800">
                        {stop.place_name.trim() || `จุดแวะที่ ${idx + 1}`}
                      </span>
                      <span className="ml-2 text-xs font-semibold text-slate-400">
                        (ลำดับที่ {idx + 1})
                      </span>
                    </div>
                  </div>

                  {/* Reorder and Delete Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveStop(idx, "up")}
                      className="rounded-xl border-2 border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === stops.length - 1}
                      onClick={() => moveStop(idx, "down")}
                      className="rounded-xl border-2 border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={stops.length <= 1}
                      onClick={() => removeStop(idx)}
                      className="rounded-xl border-2 border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 disabled:opacity-30 ml-1"
                      title="ลบจุดแวะนี้"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stop Card Body: 2 Columns */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Left Column: Multi-Photo Upload for Stop (Like Header) */}
                  <div className="lg:col-span-5 space-y-2">
                    <MultiImageUploadField
                      images={
                        stop.image_url
                          ? stop.image_url
                              .split(/[\n,;]+/)
                              .map((u) => u.trim())
                              .filter(Boolean)
                          : []
                      }
                      onChange={(newImages) =>
                        updateStopField(idx, "image_url", newImages.join("\n"))
                      }
                      label={`รูปถ่ายจุดแวะที่ ${idx + 1}`}
                      helperText="สามารถอัปโหลดได้หลายรูป (ครอบตัด 3:4 และย่อขนาด Full HD ให้อัตโนมัติ)"
                      title={stop.place_name || `จุดแวะที่ ${idx + 1}`}
                      province={province || "ประเทศไทย"}
                    />
                  </div>

                  {/* Right Column: Place Name, Description, Map Pinning & Details */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Place Name */}
                    <div>
                      <label className="mb-1 block text-xs font-black text-slate-700">
                        ชื่อสถานที่ (Place Name) *
                      </label>
                      <input
                        type="text"
                        value={stop.place_name}
                        onChange={(e) =>
                          updateStopField(idx, "place_name", e.target.value)
                        }
                        placeholder="เช่น วัดพระเชตุพนวิมลมังคลาราม (วัดโพธิ์)"
                        className="cute-input w-full border-2 border-slate-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl text-xs sm:text-sm font-bold py-2 px-3"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-1 block text-xs font-black text-slate-700">
                        คำอธิบายจุดแวะ (Description) *
                      </label>
                      <textarea
                        rows={2}
                        value={stop.description}
                        onChange={(e) =>
                          updateStopField(idx, "description", e.target.value)
                        }
                        placeholder="ไฮไลท์ของจุดนี้คืออะไร ทำไมต้องมา มีมุมถ่ายรูปไหนน่าสนใจ..."
                        className="cute-input w-full border-2 border-slate-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl text-xs sm:text-sm font-medium py-2 px-3"
                      />
                    </div>

                    {/* Map Pinning Section */}
                    <div className="rounded-2xl border-2 border-teal-200 bg-teal-50/40 p-3 sm:p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-[var(--color-brand-primary)]" />
                          <span>ปักหมุดตำแหน่งในแผนที่ (Map Pinning) *</span>
                        </span>
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                          ค้นหาหรือคลิกบนแผนที่
                        </span>
                      </div>

                      {/* Interactive Location Picker Map */}
                      <LocationPickerMap
                        latitude={stop.latitude ? Number(stop.latitude) : null}
                        longitude={stop.longitude ? Number(stop.longitude) : null}
                        placeName={stop.place_name}
                        onChange={(lat, lng) => {
                          updateStopField(idx, "latitude", String(lat));
                          updateStopField(idx, "longitude", String(lng));
                        }}
                      />

                      {/* Manual coordinate check inputs */}
                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-slate-600">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            ละติจูด (Latitude)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={stop.latitude}
                            onChange={(e) =>
                              updateStopField(idx, "latitude", e.target.value)
                            }
                            placeholder="13.7563"
                            className="cute-input w-full text-xs font-mono font-bold border border-slate-300 py-1 px-2 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            ลองจิจูด (Longitude)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={stop.longitude}
                            onChange={(e) =>
                              updateStopField(idx, "longitude", e.target.value)
                            }
                            placeholder="100.5018"
                            className="cute-input w-full text-xs font-mono font-bold border border-slate-300 py-1 px-2 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cost Field */}
                    <div>
                      <label className="mb-1 block text-xs font-black text-slate-700">
                        ค่าใช้จ่ายประมาณ (บาท)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stop.estimated_cost}
                        onChange={(e) =>
                          updateStopField(idx, "estimated_cost", e.target.value)
                        }
                        placeholder="เช่น 100 (ใส่ 0 หากฟรี หรือเว้นว่างได้)"
                        className="cute-input w-full border-2 border-slate-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl text-xs py-2 px-3 font-bold"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="mb-1 block text-xs font-black text-slate-700">
                        หมายเหตุหรือคำแนะนำจุดนี้ (Notes)
                      </label>
                      <input
                        type="text"
                        value={stop.notes}
                        onChange={(e) =>
                          updateStopField(idx, "notes", e.target.value)
                        }
                        placeholder="เช่น ปิดทุกวันจันทร์, แต่งกายสุภาพ, แนะนำให้จอดรถฝั่งตรงข้าม"
                        className="cute-input w-full border-2 border-slate-300 focus:border-[var(--color-brand-primary)] bg-white rounded-xl text-xs py-2 px-3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Stop Button at Bottom */}
          <div className="mt-6">
            <button
              type="button"
              onClick={addStop}
              className="cute-btn cute-btn-secondary inline-flex items-center justify-center gap-2 py-3 px-6 text-xs font-black w-full border-2 border-dashed border-slate-300 hover:border-[var(--color-brand-primary)]"
            >
              <Plus className="h-4 w-4 text-[var(--color-brand-primary)]" />
              <span>{t.submissions.addStopBtn}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SOLID BOTTOM ACTION BAR (Non-ghost Tactile CTA Buttons)        */}
        {/* ========================================================================= */}
        <div className="sticky bottom-4 z-20 rounded-2xl border-2 border-slate-300 bg-white/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-slate-600 hidden sm:block">
              <span>กด</span>{" "}
              <strong className="text-amber-700 font-black">
                &quot;บันทึกเป็นแบบร่าง&quot;
              </strong>{" "}
              <span>ได้ตลอดเวลาโดยไม่ต้องเช็คเงื่อนไข</span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
              {/* Cancel Button */}
              <Link
                href="/submissions"
                className="cute-btn border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold py-2.5 px-5 rounded-xl text-xs transition shadow-xs text-center flex-1 sm:flex-initial"
              >
                ยกเลิก
              </Link>

              {/* Save Draft Button (No validation needed!) */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit("draft")}
                className="cute-btn inline-flex items-center justify-center gap-2 border-2 border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black py-2.5 px-5 rounded-xl text-xs transition shadow-sm active:scale-95 disabled:opacity-50 flex-1 sm:flex-initial"
              >
                <Save className="h-4 w-4 text-amber-800" />
                <span>
                  {isSubmitting ? t.submissions.submitting : t.submissions.saveAsDraft}
                </span>
              </button>

              {/* Submit for Review Button (Strict Validation) */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit("pending_review")}
                className="cute-btn inline-flex items-center justify-center gap-2 border-2 border-teal-800 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-teal-deep)] text-white font-black py-2.5 px-6 rounded-xl text-xs transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 flex-1 sm:flex-initial"
              >
                <Send className="h-4 w-4 text-white" />
                <span>
                  {isSubmitting
                    ? t.submissions.submitting
                    : t.submissions.submitForReview}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
