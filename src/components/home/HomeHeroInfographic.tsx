"use client";

import {
  Camera,
  Plane,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  Check,
  ArrowRight,
  Sun,
  Wallet,
} from "lucide-react";

interface HomeHeroInfographicProps {
  locale: "th" | "en";
}

export function HomeHeroInfographic({ locale }: HomeHeroInfographicProps) {
  return (
    <div className="animate-fade-up delay-150 lg:col-span-7">
      <div className="relative mx-auto max-w-2xl lg:max-w-none">
        {/* Floating Decorative Doodles & Stickers around the Infographic */}
        {/* Top-left Teal Camera Sticker */}
        <div
          className="pointer-events-none absolute -left-4 -top-4 z-30 hidden h-11 w-11 -rotate-12 items-center justify-center rounded-2xl border-2 border-white bg-[#0EB5C2] text-white shadow-lg sm:flex"
          aria-hidden="true"
        >
          <Camera className="h-5 w-5" />
        </div>

        {/* Top-right Paper Plane Sticker */}
        <div
          className="pointer-events-none absolute -right-2 -top-4 z-30 hidden h-10 w-10 rotate-12 items-center justify-center rounded-2xl border-2 border-white bg-[#E3F8FA] text-[#097C87] shadow-md sm:flex"
          aria-hidden="true"
        >
          <Plane className="h-5 w-5" />
        </div>

        {/* Left Tilted Yellow Note ("เที่ยวตามรอยได้เลย! ♡") */}
        <div
          className="pointer-events-none absolute -left-5 top-[32%] z-30 hidden -rotate-6 rounded-2xl border-2 border-[#F6C343] bg-[#FFF2B2] px-3.5 py-2.5 text-center shadow-lg xl:block"
          aria-hidden="true"
        >
          <p className="font-heading text-xs font-black leading-tight text-[#523A00]">
            {locale === "th" ? (
              <>
                เที่ยว
                <br />
                ตามรอย
                <br />
                ได้เลย! ♡
              </>
            ) : (
              <>
                Ready
                <br />
                to follow! ♡
              </>
            )}
          </p>
        </div>

        {/* Bottom-right Sun & TAMROI Badge */}
        <div
          className="pointer-events-none absolute -bottom-3 -right-2 z-30 hidden items-center gap-1.5 rounded-full border-2 border-white bg-[#FFF8DF] px-3 py-1.5 shadow-lg sm:flex"
          aria-hidden="true"
        >
          <Sun className="h-4 w-4 text-[#F6C343]" />
          <span className="text-[11px] font-black tracking-wide text-[#097C87]">TAMROI</span>
        </div>

        {/* Floating Header Pills: TAMROI VISUAL GUIDE & Saves ~3 hrs */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
          {/* White Pill: TAMROI VISUAL GUIDE */}
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#BCE8EC] bg-white px-3.5 py-2 text-slate-900 shadow-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0EB5C2] text-white shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-heading text-xs font-black tracking-wide text-[#065A62] sm:text-sm">
                  TAMROI VISUAL GUIDE
                </span>
                <span className="rounded-full bg-[#E2F7F9] px-2 py-0.5 text-[10px] font-extrabold text-[#097C87]">
                  INFOGRAPHIC
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {locale === "th"
                  ? "3 ขั้นตอนเที่ยวตามรอยได้ทันที ไม่ต้องจัดตารางเอง"
                  : "3 Steps from Discovery to Turn-by-Turn Navigation"}
              </p>
            </div>
          </div>

          {/* Warm Yellow Pill: Saves ~3 hrs */}
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-[#FFE27A] px-4 py-2 text-xs font-extrabold text-[#523A00] shadow-md">
            <Clock className="h-4 w-4 text-[#694800]" aria-hidden="true" />
            <span>
              {locale === "th"
                ? "ประหยัดเวลาวางแผน ~3 ชม."
                : "Saves ~3 hrs planning"}
            </span>
          </div>
        </div>

        {/* Main Route Blueprint Card with Pale Cyan Background */}
        <div className="rounded-[2rem] border-[3px] border-[#A8E4EA] bg-[#E8F8FA] p-3.5 text-slate-900 shadow-2xl sm:p-4">
          {/* Header Row inside Route Blueprint */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#00828A] px-3.5 py-1 text-xs font-black text-white shadow-sm">
                {locale === "th" ? "ตัวอย่างเส้นทางจริง" : "Live Route Blueprint"}
              </span>
              <span className="font-heading text-xs font-extrabold text-[#064E54] sm:text-sm">
                {locale === "th"
                  ? "เดินชิลล์เกาะรัตนโกสินทร์ (ครึ่งวัน)"
                  : "Rattanakosin Old Town Walk (Half Day)"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#064E54]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#00828A]" aria-hidden="true" />
                4 {locale === "th" ? "จุดแวะต่อเนื่อง" : "Ordered Stops"}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-[#00828A]" aria-hidden="true" />
                ฿420
              </span>
            </div>
          </div>

          {/* Curved Dashed Line with 4 Colored Node Dots */}
          <div className="my-1 hidden sm:block" aria-hidden="true">
            <svg viewBox="0 0 640 22" className="h-5 w-full">
              <path
                d="M 75 13 Q 160 4, 245 13 T 405 11 T 565 13"
                fill="none"
                stroke="#68C5CE"
                strokeWidth="2.2"
                strokeDasharray="5 5"
              />
              <circle cx="75" cy="13" r="5" fill="#14B8C6" />
              <circle cx="245" cy="13" r="5" fill="#58B67C" />
              <circle cx="405" cy="11" r="5" fill="#F6C343" />
              <circle cx="565" cy="13" r="5" fill="#F47A6A" />
            </svg>
          </div>

          {/* 4 Illustrated Stop Cards (Flat Graphic Art style from user image) */}
          <div className="mt-1 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {/* Card 1: มิวเซียมสยาม (สนาม...) */}
            <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-white bg-white p-2 shadow-sm transition-transform hover:-translate-y-0.5">
              <ArrowRight
                className="pointer-events-none absolute -right-2.5 top-1/2 z-10 hidden h-3.5 w-3.5 -translate-y-1/2 text-[#00828A] sm:block"
                aria-hidden="true"
              />

              {/* Graphic Illustration 1: Temple / Museum Siam Spire */}
              <div className="relative h-20 w-full overflow-hidden rounded-xl border border-[#D5F0F3] bg-[#BFEBF0]">
                <svg viewBox="0 0 160 88" className="h-full w-full object-cover" aria-hidden="true">
                  <rect width="160" height="88" fill="#BFEBF0" />
                  <rect y="70" width="160" height="18" fill="#67B876" />
                  {/* Temple Triangles & Stupas */}
                  <polygon points="26,70 36,36 46,70" fill="#F5AE38" />
                  <polygon points="58,70 76,28 94,70" fill="#F8BC42" />
                  <polygon points="76,32 70,52 82,52" fill="#D95338" />
                  <rect x="71" y="52" width="10" height="18" fill="#FFFFFF" />
                  <polygon points="106,70 116,36 126,70" fill="#F5AE38" />
                </svg>

                {/* Number Circle Top-Left */}
                <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0EB5C2] text-xs font-black text-white shadow-sm">
                  1
                </span>

                {/* Time Pill Top-Right */}
                <span className="absolute right-1.5 top-1.5 rounded-full bg-[#18393D] px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm">
                  08:30
                </span>
              </div>

              {/* Text Info & Icon */}
              <div className="mt-2 flex items-end justify-between gap-1 px-0.5">
                <div className="min-w-0">
                  <p className="truncate font-heading text-xs font-black text-[#064E54]">
                    {locale === "th" ? "มิวเซียมสยาม (สนา..." : "Museum Siam (St..."}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#097C87]">
                    {locale === "th" ? "60 นาที • ฿100" : "60m • ฿100"}
                  </p>
                </div>
                {/* Temple Pill Icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#0EB5C2]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 21V10l8-7 8 7v11M9 21v-6h6v6" />
                </svg>
              </div>
            </div>

            {/* Card 2: วัดโพธิ์ ท่าเตียน */}
            <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-white bg-white p-2 shadow-sm transition-transform hover:-translate-y-0.5">
              <ArrowRight
                className="pointer-events-none absolute -right-2.5 top-1/2 z-10 hidden h-3.5 w-3.5 -translate-y-1/2 text-[#00828A] sm:block"
                aria-hidden="true"
              />

              {/* Graphic Illustration 2: River & Floating Boats */}
              <div className="relative h-20 w-full overflow-hidden rounded-xl border border-[#D5F0F3] bg-[#6DCFD8]">
                <svg viewBox="0 0 160 88" className="h-full w-full object-cover" aria-hidden="true">
                  <rect width="160" height="88" fill="#6DCFD8" />
                  <rect y="50" width="160" height="38" fill="#2993A3" />
                  {/* Round green hill & Golden Temple */}
                  <circle cx="28" cy="38" r="22" fill="#4AA86C" />
                  <polygon points="70,50 82,24 94,50" fill="#F8BC42" />
                  <circle cx="134" cy="38" r="22" fill="#207485" />
                  {/* Colorful Longtail Boats */}
                  <path d="M12 68 Q 44 80 76 68 L 68 62 L 20 62 Z" fill="#F47A6A" />
                  <path d="M72 76 Q 106 88 140 76 L 132 70 L 80 70 Z" fill="#F8BC42" />
                </svg>

                {/* Number Circle Top-Left */}
                <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#58B67C] text-xs font-black text-white shadow-sm">
                  2
                </span>

                {/* Time Pill Top-Right */}
                <span className="absolute right-1.5 top-1.5 rounded-full bg-[#18393D] px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm">
                  10:00
                </span>
              </div>

              {/* Text Info & Icon */}
              <div className="mt-2 flex items-end justify-between gap-1 px-0.5">
                <div className="min-w-0">
                  <p className="truncate font-heading text-xs font-black text-[#064E54]">
                    {locale === "th" ? "วัดโพธิ์ ท่าเตียน" : "Wat Pho Temple"}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#097C87]">
                    {locale === "th" ? "75 นาที • ฿0–200" : "75m • ฿0–200"}
                  </p>
                </div>
                {/* Boat Icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#00828A]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 17l20 2-4 4H6l-4-6zm10-5V4m-5 8h10" />
                </svg>
              </div>
            </div>

            {/* Card 3: คาเฟ่ริมน้ำท่าเตียน */}
            <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-white bg-white p-2 shadow-sm transition-transform hover:-translate-y-0.5">
              <ArrowRight
                className="pointer-events-none absolute -right-2.5 top-1/2 z-10 hidden h-3.5 w-3.5 -translate-y-1/2 text-[#00828A] sm:block"
                aria-hidden="true"
              />

              {/* Graphic Illustration 3: Cute Riverside Cafe House */}
              <div className="relative h-20 w-full overflow-hidden rounded-xl border border-[#D5F0F3] bg-[#CEEFF3]">
                <svg viewBox="0 0 160 88" className="h-full w-full object-cover" aria-hidden="true">
                  <rect width="160" height="88" fill="#CEEFF3" />
                  <rect y="72" width="160" height="16" fill="#80D1D8" />
                  {/* Brown Roof & White House */}
                  <polygon points="32,46 80,18 128,46" fill="#D95C38" />
                  <rect x="42" y="46" width="76" height="34" fill="#FFF2CF" />
                  <rect x="52" y="54" width="14" height="18" rx="2" fill="#097C87" />
                  <rect x="73" y="54" width="14" height="26" rx="2" fill="#097C87" />
                  <rect x="94" y="54" width="14" height="18" rx="2" fill="#097C87" />
                </svg>

                {/* Number Circle Top-Left */}
                <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#F6C343] text-xs font-black text-white shadow-sm">
                  3
                </span>

                {/* Time Pill Top-Right */}
                <span className="absolute right-1.5 top-1.5 rounded-full bg-[#18393D] px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm">
                  12:00
                </span>
              </div>

              {/* Text Info & Icon */}
              <div className="mt-2 flex items-end justify-between gap-1 px-0.5">
                <div className="min-w-0">
                  <p className="truncate font-heading text-xs font-black text-[#064E54]">
                    {locale === "th" ? "คาเฟ่ริมน้ำท่าเตียน" : "Tha Tien Cafe"}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#097C87]">
                    {locale === "th" ? "60 นาที • ฿220" : "60m • ฿220"}
                  </p>
                </div>
                {/* Coffee Cup Icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#F6C343]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
                </svg>
              </div>
            </div>

            {/* Card 4: สวนลอยฟ้าเจ้าพระยา */}
            <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-white bg-white p-2 shadow-sm transition-transform hover:-translate-y-0.5">
              {/* Graphic Illustration 4: Sunset Prang Wat Arun & Trees */}
              <div className="relative h-20 w-full overflow-hidden rounded-xl border border-[#D5F0F3] bg-[#FED9BD]">
                <svg viewBox="0 0 160 88" className="h-full w-full object-cover" aria-hidden="true">
                  <rect width="160" height="88" fill="#FED9BD" />
                  <rect y="64" width="160" height="24" fill="#0E8A98" />
                  {/* Sunset Wat Arun Silhouettes & Round Trees */}
                  <polygon points="56,64 74,20 92,64" fill="#DE723A" />
                  <polygon points="40,64 50,38 60,64" fill="#E88A54" />
                  <polygon points="88,64 98,38 108,64" fill="#E88A54" />
                  <circle cx="24" cy="62" r="18" fill="#58B67C" />
                  <circle cx="136" cy="62" r="18" fill="#58B67C" />
                </svg>

                {/* Number Circle Top-Left */}
                <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#F47A6A] text-xs font-black text-white shadow-sm">
                  4
                </span>

                {/* Time Pill Top-Right */}
                <span className="absolute right-1.5 top-1.5 rounded-full bg-[#18393D] px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm">
                  16:30
                </span>
              </div>

              {/* Text Info & Icon */}
              <div className="mt-2 flex items-end justify-between gap-1 px-0.5">
                <div className="min-w-0">
                  <p className="truncate font-heading text-xs font-black text-[#064E54]">
                    {locale === "th" ? "สวนลอยฟ้าเจ้าพระยา" : "Sky Park Bridge"}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#097C87]">
                    {locale === "th" ? "45 นาที • เข้าฟรี" : "45m • Free"}
                  </p>
                </div>
                {/* Tree Icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#58B67C]" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a6 6 0 0 0-6 6c0 2.5 1.5 4.6 3.6 5.5L9 22h6l-.6-8.5A6 6 0 0 0 12 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Cyan Action Bar inside Blueprint */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#A8E4EA] bg-[#D7F3F6] px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#064E54]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00828A] text-white">
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
              <span>
                {locale === "th"
                  ? "เชื่อมพิกัด Lat/Lng ครบทุกจุดพร้อมส่งออก"
                  : "All Lat/Lng waypoints verified & ready"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F6C343] px-3 py-1 text-[11px] font-black text-[#523A00] shadow-sm">
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                Google Maps
              </span>
            </div>
          </div>
        </div>

        {/* Bottom 3 Step Cards (STEP 01 Aqua, STEP 02 Soft Sage, STEP 03 Sunrise Peach) */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* STEP 01 - Aqua */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#A8E4EA] bg-[#F1FBFC] p-3.5 text-slate-900 shadow-md">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-heading text-xs font-black tracking-wide text-[#00828A]">
                  STEP 01
                </span>
                <span className="rounded-full bg-[#00828A] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                  {locale === "th" ? "คัดมาให้แล้ว" : "Handpicked"}
                </span>
              </div>
              <div className="mt-2 inline-block rounded-lg bg-[#00828A] px-2.5 py-1 font-heading text-xs font-extrabold text-white">
                {locale === "th" ? "เลือกทริปตามสไตล์ & งบ" : "Pick Your Vibe & Budget"}
              </div>
            </div>
          </div>

          {/* STEP 02 - Soft Sage Green */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#BDE5CA] bg-[#F3FBF6] p-3.5 text-slate-900 shadow-md">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-heading text-xs font-black tracking-wide text-[#237746]">
                  STEP 02
                </span>
                <span className="rounded-full bg-[#BDE5CA] px-2.5 py-0.5 text-[10px] font-extrabold text-[#175E35]">
                  Interactive Map
                </span>
              </div>
              <h3 className="mt-2 font-heading text-xs font-black text-slate-900 sm:text-sm">
                {locale === "th"
                  ? "เช็กแมพ & เวลาแวะแต่ละจุด"
                  : "Inspect Route & Timing"}
              </h3>
            </div>
          </div>

          {/* STEP 03 - Sunrise Peach / Coral */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#F9C8BD] bg-[#FFF6F3] p-3.5 text-slate-900 shadow-md">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-heading text-xs font-black tracking-wide text-[#DE5B47]">
                  STEP 03
                </span>
                <span className="rounded-full bg-[#FDE2DC] px-2.5 py-0.5 text-[10px] font-extrabold text-[#B93A26]">
                  {locale === "th" ? "พร้อมออกเดินทาง!" : "Ready to Go!"}
                </span>
              </div>
              <h3 className="mt-2 font-heading text-xs font-black text-slate-900 sm:text-sm">
                {locale === "th"
                  ? "กดเปิดนำทาง Google Maps ทันที"
                  : "Launch in Google Maps"}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
