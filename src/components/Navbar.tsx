"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Route,
  ShieldCheck,
  Globe,
  Sparkles,
  Bookmark,
  User as UserIcon,
  LogIn,
  LogOut,
  FolderHeart,
  FilePlus,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider";

export function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const { user, loading, logout, savedTripIds } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide consumer public navbar completely when in admin mode
  if (pathname.startsWith("/admin")) {
    return null;
  }

  async function handleLogout() {
    setDropdownOpen(false);
    await logout();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--color-border-subtle)] bg-white/95 shadow-sm backdrop-blur-md">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-[var(--color-brand-primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t.nav.skipToContent}
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 text-slate-900 transition hover:text-[var(--color-brand-primary)]"
        >
          {/* Cute Rounded Route Badge Icon matching the Visual Guide */}
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-accent-aqua)] text-white shadow-[0_4px_0_rgba(9,124,135,0.25)] transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
            <Route className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-black tracking-tight text-[var(--color-brand-deep)] sm:text-xl">
                TAMROI
              </span>
              <span className="inline-flex -rotate-2 items-center gap-1 rounded-full border-2 border-white bg-[var(--color-sun-yellow-light)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-sun-text)] shadow-sm transition-transform group-hover:rotate-2">
                <Sparkles className="h-3 w-3 text-[var(--color-sun-amber)]" aria-hidden="true" />
                ตามรอย
              </span>
            </div>
            <p className="hidden text-xs font-medium text-[var(--color-brand-primary)]/80 sm:block">
              {t.nav.tagline}
            </p>
          </div>
        </Link>

        <nav aria-label="Primary navigation" className="flex items-center gap-2 sm:gap-3">
          {/* Saved Trips link - only when logged in */}
          {user && (
            <Link
              href="/saved"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-card-photo)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-brand-deep)] transition-all hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)]"
              title={t.nav.savedTrips}
            >
              <Bookmark className="h-3.5 w-3.5 text-[var(--color-brand-primary)] fill-current" aria-hidden="true" />
              <span className="hidden sm:inline">{t.nav.savedTrips}</span>
              {savedTripIds.length > 0 && (
                <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-brand-primary)] px-1 text-[10px] font-black text-white">
                  {savedTripIds.length}
                </span>
              )}
            </Link>
          )}

          {/* Community Submissions Link */}
          {user && (
            <Link
              href="/submissions"
              className="hidden items-center gap-1.5 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-brand-deep)] transition-all hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)] md:inline-flex"
            >
              <FilePlus className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
              <span>{t.nav.mySubmissions}</span>
            </Link>
          )}

          {/* Admin quick link - only when logged in as admin */}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-900 transition-all hover:bg-amber-100 lg:inline-flex"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
              <span>{t.nav.admin}</span>
            </Link>
          )}

          {/* Cute Language Switcher Pill (TH default / EN) */}
          <div
            role="group"
            aria-label={t.nav.langSwitchLabel}
            className="inline-flex items-center rounded-full border-2 border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] p-1 shadow-[0_3px_0_rgba(9,124,135,0.12)]"
          >
            <Globe
              className="ml-2 mr-1 hidden h-3.5 w-3.5 text-[var(--color-brand-primary)] sm:inline"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setLocale("th")}
              aria-pressed={locale === "th"}
              className={`rounded-full px-3 py-1 text-xs font-extrabold transition-all duration-200 ${
                locale === "th"
                  ? "bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-sm"
                  : "text-[var(--color-brand-deep)]/75 hover:text-[var(--color-brand-primary)]"
              }`}
            >
              ไทย
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={`rounded-full px-3 py-1 text-xs font-extrabold transition-all duration-200 ${
                locale === "en"
                  ? "bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-sm"
                  : "text-[var(--color-brand-deep)]/75 hover:text-[var(--color-brand-primary)]"
              }`}
            >
              EN
            </button>
          </div>

          {/* User Account or Sign In */}
          {!loading && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-[0_3px_0_rgba(9,124,135,0.14)] transition-all hover:border-[var(--color-brand-primary)]"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-[10px] font-black text-white">
                    {user.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="max-w-[100px] truncate sm:max-w-[140px]">
                  {user.display_name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border-2 border-[var(--color-border-subtle)] bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-black text-slate-800 truncate">
                      {user.display_name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    {user.role === "admin" && (
                      <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[var(--color-bg-soft)]"
                    >
                      <UserIcon className="h-4 w-4 text-[var(--color-brand-primary)]" />
                      {t.nav.profile}
                    </Link>

                    <Link
                      href="/saved"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[var(--color-bg-soft)]"
                    >
                      <FolderHeart className="h-4 w-4 text-[var(--color-brand-primary)]" />
                      {t.nav.savedTrips}
                    </Link>

                    <Link
                      href="/submissions"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[var(--color-bg-soft)]"
                    >
                      <FilePlus className="h-4 w-4 text-[var(--color-brand-primary)]" />
                      {t.nav.mySubmissions}
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50"
                      >
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                        {t.nav.admin}
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      {t.nav.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--color-border-subtle)] bg-white px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-brand-deep)] shadow-[0_3px_0_rgba(9,124,135,0.14)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-soft)]"
              >
                <LogIn className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" aria-hidden="true" />
                <span>{t.nav.login}</span>
              </Link>
              <Link
                href="/admin"
                className="hidden items-center gap-1 rounded-full border-2 border-transparent px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 sm:inline-flex"
                title="Admin Login"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span className="hidden xl:inline">Admin</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
