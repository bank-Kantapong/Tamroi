"use client";

import {
  Camera,
  Heart,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  Map,
  Car,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  TempleStopIllustration,
  FoodStopIllustration,
  CafeStopIllustration,
  SunsetStopIllustration,
} from "@/components/illustrations";

interface HomeHeroInfographicProps {
  locale: "th" | "en";
}

export function HomeHeroInfographic({ locale }: HomeHeroInfographicProps) {
  return (
    <div className="animate-fade-up delay-150 lg:col-span-7">
      <div className="relative mx-auto max-w-2xl lg:max-w-none">
        {/* Floating Decorative Doodles & Stickers around the Infographic */}
        {/* Top-left Camera Doodle */}
        <div
          className="pointer-events-none absolute -left-3 -top-3 z-20 hidden h-11 w-11 -rotate-12 items-center justify-center rounded-2xl border-2 border-white bg-[var(--color-accent-aqua)] text-[var(--color-brand-deep)] shadow-lg sm:flex"
          aria-hidden="true"
        >
          <Camera className="h-5 w-5" />
        </div>

        {/* Top-right Heart Doodle */}
        <div
          className="pointer-events-none absolute -right-2 -top-2 z-20 hidden h-10 w-10 rotate-12 items-center justify-center rounded-2xl border-2 border-white bg-[var(--color-peach)] text-[var(--color-brand-deep)] shadow-lg sm:flex"
          aria-hidden="true"
        >
          <Heart className="h-5 w-5 fill-current text-[var(--color-coral-accent)]" />
        </div>

        {/* Main Illustrated Banner Card (Replicating user's bright infographic banner) */}
        <div className="relative overflow-hidden rounded-3xl border-4 border-white/80 bg-gradient-to-b from-white via-white to-[var(--color-bg-card-photo)] p-4 shadow-2xl sm:p-6">
          {/* Top Header of the Infographic with Mascot-style badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[var(--color-border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand-primary)] text-white shadow-md">
                <Sparkles className="h-6 w-6 text-[var(--color-sun-yellow-light)]" />
              </span>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-mint-badge-bg)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-mint-text-dark)]">
                  <span>🗺️</span>
                  <span>{locale === "th" ? "คู่มือการเดินทางแบบพร้อมลุย" : "Ready-to-Follow Itinerary"}</span>
                </div>
                <p className="mt-0.5 font-heading text-sm font-black text-[var(--color-brand-deep)] sm:text-base">
                  {locale === "th" ? "3 สเต็ปง่ายๆ เที่ยวตามรอยได้ทันที" : "3 Simple Steps to Follow Any Trip"}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-amber-200 bg-[var(--color-sun-cream)] px-3 py-1 text-xs font-black text-[var(--color-sun-amber)] shadow-sm">
              ✨ 100% Free
            </span>
          </div>

          {/* Visual Route Preview Card (SVG Map Mockup with Ordered Stops) */}
          <div className="relative mt-4 overflow-hidden rounded-2xl border-2 border-[var(--color-border-alt)] bg-gradient-to-br from-[var(--color-bg-aqua-fade)] via-white to-[var(--color-mint-bg-alt)] p-4 sm:p-5">
            {/* Top Bar inside Route Canvas */}
            <div className="flex items-center justify-between text-xs font-extrabold text-[var(--color-brand-deep)]">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-heading font-black">
                  {locale === "th" ? "เส้นทางตัวอย่าง: ไหว้พระ & คาเฟ่ริมน้ำ" : "Sample Route: Riverside Temple & Cafe"}
                </span>
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-[11px] font-bold text-[var(--color-brand-primary)] shadow-sm">
                4 STOPS
              </span>
            </div>

            {/* Simulated Route Steps with Colorful Number Pins */}
            <div className="relative mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Stop 1 */}
              <div className="relative flex flex-col rounded-2xl border-2 border-white bg-white/90 p-3 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand-cyan)] font-heading text-xs font-black text-white shadow-sm">
                    1
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">09:00</span>
                </div>
                <div className="mt-2.5 h-16 w-full overflow-hidden rounded-xl bg-gradient-to-tr from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] p-2 text-white">
                  <TempleStopIllustration className="h-full w-full opacity-90" />
                </div>
                <p className="mt-2 truncate font-heading text-xs font-extrabold text-slate-900">
                  {locale === "th" ? "วัดมหาธาตุ" : "Wat Mahathat"}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  {locale === "th" ? "จุดเริ่มต้น" : "Start Point"}
                </p>
              </div>

              {/* Stop 2 */}
              <div className="relative flex flex-col rounded-2xl border-2 border-white bg-white/90 p-3 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-sage-dark)] font-heading text-xs font-black text-white shadow-sm">
                    2
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">11:30</span>
                </div>
                <div className="mt-2.5 h-16 w-full overflow-hidden rounded-xl bg-gradient-to-tr from-[var(--color-sage-dark)] to-[var(--color-mint-icon)] p-2 text-white">
                  <FoodStopIllustration className="h-full w-full opacity-90" />
                </div>
                <p className="mt-2 truncate font-heading text-xs font-extrabold text-slate-900">
                  {locale === "th" ? "ก๋วยเตี๋ยวเรือป้าเล็ก" : "Local Noodle Shop"}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  {locale === "th" ? "มื้อกลางวัน" : "Lunch Break"}
                </p>
              </div>

              {/* Stop 3 */}
              <div className="relative flex flex-col rounded-2xl border-2 border-white bg-white/90 p-3 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-sun-yellow)] font-heading text-xs font-black text-slate-900 shadow-sm">
                    3
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">14:00</span>
                </div>
                <div className="mt-2.5 h-16 w-full overflow-hidden rounded-xl bg-gradient-to-tr from-amber-400 to-[var(--color-sun-yellow-light)] p-2 text-white">
                  <CafeStopIllustration className="h-full w-full opacity-90" />
                </div>
                <p className="mt-2 truncate font-heading text-xs font-extrabold text-slate-900">
                  {locale === "th" ? "ริมน้ำ คาเฟ่" : "Riverside Cafe"}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  {locale === "th" ? "พักดื่มกาแฟ" : "Coffee & Chill"}
                </p>
              </div>

              {/* Stop 4 */}
              <div className="relative flex flex-col rounded-2xl border-2 border-white bg-white/90 p-3 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-coral-accent)] font-heading text-xs font-black text-white shadow-sm">
                    4
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">17:30</span>
                </div>
                <div className="mt-2.5 h-16 w-full overflow-hidden rounded-xl bg-gradient-to-tr from-[var(--color-coral-accent)] to-[var(--color-peach)] p-2 text-white">
                  <SunsetStopIllustration className="h-full w-full opacity-90" />
                </div>
                <p className="mt-2 truncate font-heading text-xs font-extrabold text-slate-900">
                  {locale === "th" ? "จุดชมวิวพระอาทิตย์" : "Sunset Viewpoint"}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  {locale === "th" ? "จุดสุดท้าย" : "Final Sunset"}
                </p>
              </div>
            </div>

            {/* Route Action Pill inside Mockup */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/60 bg-white/80 px-3.5 py-2 text-xs backdrop-blur-sm">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <Clock className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
                <span>{locale === "th" ? "ทริป 1 วัน (แวะเที่ยวรวม ~6 ชม.)" : "1-Day Trip (~6 hrs total)"}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-subtle)] bg-white px-3 py-1 text-[11px] font-extrabold text-[var(--color-brand-primary)] shadow-sm">
                  <Copy className="h-3 w-3" aria-hidden="true" />
                  Lat, Lng
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-sun-yellow)] px-3 py-1 text-[11px] font-extrabold text-slate-900 shadow-sm">
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  Google Maps
                </span>
              </div>
            </div>
          </div>

          {/* Bottom 3 Pastel Step Cards (STEP 01 Aqua, STEP 02 Sage, STEP 03 Peach) */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* STEP 01 - Aqua */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[var(--color-border-alt)] bg-[var(--color-bg-soft)] p-3.5 text-slate-900 shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-heading text-xs font-black tracking-wide text-[var(--color-brand-primary)]">
                    STEP 01
                  </span>
                  <span className="rounded-full bg-[var(--color-brand-primary)] px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {locale === "th" ? "คัดมาให้แล้ว" : "Handpicked"}
                  </span>
                </div>
                <div className="mt-2 inline-block rounded-lg bg-[var(--color-brand-primary)] px-2.5 py-1 font-heading text-xs font-extrabold text-white">
                  {locale === "th" ? "เลือกทริปตามสไตล์ & งบ" : "Pick Your Vibe & Budget"}
                </div>
                <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-slate-700">
                  {locale === "th"
                    ? "คัดจุดแวะ เรียงลำดับไหลลื่น ไม่ต้องเปิด 20 แท็บ"
                    : "Curated stops in logical order—no more 20 open tabs"}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between pt-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)]">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="mx-2 h-0.5 flex-1 border-b-2 border-dashed border-[var(--color-brand-primary)]/40" />
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-bg-aqua-fade)] text-[var(--color-brand-primary)] shadow-sm">
                  <Map className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>

            {/* STEP 02 - Soft Sage Green */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[var(--color-mint-border-alt)] bg-[var(--color-mint-bg-alt)] p-3.5 text-slate-900 shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-heading text-xs font-black tracking-wide text-[var(--color-mint-text-dark)]">
                    STEP 02
                  </span>
                  <span className="rounded-full bg-[var(--color-mint-border-alt)] px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--color-mint-text-dark)]">
                    Interactive Map
                  </span>
                </div>
                <h2 className="mt-2 font-heading text-xs font-extrabold text-slate-900 sm:text-sm">
                  {locale === "th"
                    ? "เช็กแมพ & เวลาแวะแต่ละจุด"
                    : "Inspect Route & Timing"}
                </h2>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-700">
                  {locale === "th"
                    ? "เห็นเส้นทาง 1 → 2 → 3 → 4 พร้อมเวลาและค่าใช้จ่าย"
                    : "Visualize stops 1 → 2 → 3 → 4 with arrival time & cost"}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between pt-1">
                <span className="text-xs font-black text-[var(--color-sun-yellow)]">✦</span>
                <div className="mx-2 h-0.5 flex-1 border-b-2 border-dashed border-[var(--color-mint-icon)]/45" />
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-mint-bg)] text-[var(--color-mint-text-dark)] shadow-sm">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>

            {/* STEP 03 - Sunrise Peach / Coral */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[var(--color-coral-border-alt)] bg-[var(--color-coral-bg-alt)] p-3.5 text-slate-900 shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-heading text-xs font-black tracking-wide text-[var(--color-coral-text-dark)]">
                    STEP 03
                  </span>
                  <span className="rounded-full bg-[var(--color-coral-border-alt)] px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--color-coral-text-dark)]">
                    {locale === "th" ? "พร้อมออกเดินทาง!" : "Ready to Go!"}
                  </span>
                </div>
                <h2 className="mt-2 font-heading text-xs font-extrabold text-slate-900 sm:text-sm">
                  {locale === "th"
                    ? "กดเปิดนำทาง Google Maps ทันที"
                    : "Launch in Google Maps"}
                </h2>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-700">
                  {locale === "th"
                    ? "ส่งครบทุกจุดแวะ (Waypoints) หรือกดปักหมุดได้ในทีเดียว"
                    : "Send full waypoints or copy coordinates in one click"}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between pt-1">
                <span className="text-xs font-black text-[var(--color-coral-accent)]">✦</span>
                <div className="mx-2 h-0.5 flex-1 border-b-2 border-dashed border-[var(--color-coral-accent)]/45" />
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-coral-border-alt)] text-[var(--color-coral-text-dark)] shadow-sm">
                  <Car className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
