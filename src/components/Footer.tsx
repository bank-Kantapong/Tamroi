"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[var(--color-border-subtle)] bg-white/60 py-6 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4">
        <p>&copy; {currentYear} TAMROI (ตามรอย). All rights reserved.</p>
      </div>
    </footer>
  );
}
