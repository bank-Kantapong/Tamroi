import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="cute-card p-8">
        <div className="mx-auto flex h-16 w-16 -rotate-6 items-center justify-center rounded-3xl border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-card-photo)] text-[var(--color-brand-primary)] shadow-sm">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-black text-[var(--color-brand-deep)]">
          ไม่พบหน้าหรือทริปที่คุณต้องการ (404)
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600">
          ทริปนี้อาจถูกลบไปแล้ว หรือยังเป็นแบบร่างที่ไม่ได้เผยแพร่สู่สาธารณะ
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="cute-yellow-btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            กลับไปดูทริปทั้งหมด (Explore Trips)
          </Link>
        </div>
      </div>
    </div>
  );
}
