"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, X, MapPin } from "lucide-react";
import { THAI_PROVINCES, ThaiProvince } from "@/lib/provinces";

interface ProvinceSearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function ProvinceSearchSelect({
  value,
  onChange,
  label = "จังหวัด (Province) *",
  placeholder = "พิมพ์เพื่อค้นหาจังหวัด เช่น กรุงเทพ, เชียงใหม่, Phuket...",
  className = "",
}: ProvinceSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [provinces, setProvinces] = useState<ThaiProvince[]>(THAI_PROVINCES);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch provinces from API on mount (with static fallback)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/provinces");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.provinces) && data.provinces.length > 0) {
            setProvinces(data.provinces);
          }
        }
      } catch {
        // static fallback is already set
      }
    }
    void load();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = provinces.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name_th.toLowerCase().includes(q) ||
      p.name_en.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q)
    );
  });

  // Find current selected province display
  const selectedObj = provinces.find(
    (p) =>
      p.name_th.toLowerCase() === value.toLowerCase() ||
      p.name_en.toLowerCase() === value.toLowerCase()
  );

  function handleSelect(p: ThaiProvince) {
    // Save Thai name as canonical, or as chosen
    onChange(p.name_th);
    setSearchQuery("");
    setIsOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="mb-1 block text-xs font-black text-slate-700">
          {label}
        </label>
      )}

      {/* Trigger / Input box */}
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`flex items-center justify-between rounded-xl border-2 bg-white px-3 py-2 text-xs font-bold transition cursor-pointer ${
          isOpen
            ? "border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20 shadow-sm"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand-primary)]" />
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={value ? `เลือกอยู่: ${value} (พิมพ์เพื่อเปลี่ยน)` : placeholder}
              className="w-full bg-transparent text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          ) : value ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-slate-900 font-black">{value}</span>
              {selectedObj && (
                <span className="text-[11px] font-medium text-slate-400">
                  ({selectedObj.name_en})
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-medium truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="ล้างจังหวัด"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180 text-[var(--color-brand-primary)]" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border-2 border-slate-300 bg-white shadow-xl animate-fade-up">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-medium">
              ไม่พบจังหวัด &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="py-1 divide-y divide-slate-100">
              {filtered.map((p) => {
                const isSelected =
                  value === p.name_th || value === p.name_en;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-left text-xs transition hover:bg-teal-50 ${
                      isSelected
                        ? "bg-[var(--color-bg-aqua-fade)] font-black text-[var(--color-brand-primary)]"
                        : "text-slate-700 font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{p.name_th}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({p.name_en})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.region}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-[var(--color-brand-primary)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
