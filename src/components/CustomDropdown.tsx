"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function CustomDropdown({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  icon,
  ariaLabel,
  className = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        const currentIdx = options.findIndex((o) => o.value === value);
        setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, highlightedIndex]);

  const isFiltered = value !== "" && options[0]?.value === "";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (next) {
              const currentIdx = options.findIndex((o) => o.value === value);
              setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
            }
            return next;
          });
        }}
        onKeyDown={handleKeyDown}
        className={`group flex w-full items-center justify-between gap-2.5 rounded-2xl border-2 px-3.5 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-accent-aqua)]/25 ${
          isOpen
            ? "border-[var(--color-brand-primary)] bg-white shadow-[0_5px_0_rgba(9,124,135,0.16)] ring-4 ring-[var(--color-accent-aqua)]/20"
            : isFiltered
              ? "border-[var(--color-brand-primary)] bg-[var(--color-bg-card-photo)] text-[var(--color-brand-teal-darkest)] shadow-[0_4px_0_rgba(9,124,135,0.12)] hover:border-[var(--color-brand-primary)]"
              : "border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] text-[var(--color-brand-deep)] shadow-[0_3px_0_rgba(9,124,135,0.08)] hover:border-[var(--color-accent-aqua)] hover:bg-white"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {(selectedOption?.icon || icon) && (
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isOpen || isFiltered
                  ? "bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] text-white shadow-sm"
                  : "bg-[var(--color-bg-aqua-fade)] text-[var(--color-brand-primary)] group-hover:bg-[var(--color-border-subtle)]"
              }`}
            >
              {selectedOption?.icon || icon}
            </span>
          )}
          {selectedOption?.badgeColor && (
            <span
              className="h-3 w-3 shrink-0 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: selectedOption.badgeColor }}
            />
          )}
          <span className="truncate font-bold">
            {selectedOption ? selectedOption.label : placeholder || "Select..."}
          </span>
        </span>

        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
            isOpen
              ? "rotate-180 bg-[var(--color-brand-primary)] text-white"
              : "bg-white text-[var(--color-brand-primary)] shadow-sm group-hover:bg-[var(--color-bg-aqua-fade)]"
          }`}
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby={id}
          tabIndex={-1}
          className="animate-menu-pop absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border-2 border-[var(--color-border-subtle)] bg-white p-1.5 shadow-[0_10px_0_rgba(9,124,135,0.12),0_20px_38px_rgba(9,124,135,0.22)] focus:outline-none"
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={`${option.value}-${idx}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-cyan)] font-extrabold text-white shadow-sm"
                    : isHighlighted
                      ? "bg-[var(--color-bg-card-photo)] font-bold text-[var(--color-brand-deep)]"
                      : "font-medium text-slate-700 hover:bg-[var(--color-bg-soft)]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {option.icon && (
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[var(--color-bg-aqua-fade)] text-[var(--color-brand-primary)]"
                      }`}
                    >
                      {option.icon}
                    </span>
                  )}
                  {option.badgeColor && (
                    <span
                      className={`h-3 w-3 shrink-0 rounded-full ${
                        isSelected ? "border-2 border-white" : "border border-white shadow-sm"
                      }`}
                      style={{ backgroundColor: option.badgeColor }}
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                  {option.sublabel && (
                    <span
                      className={`truncate text-xs ${
                        isSelected ? "text-white/85" : "text-slate-400"
                      }`}
                    >
                      {option.sublabel}
                    </span>
                  )}
                </span>

                {isSelected && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-sun-yellow-light)] text-[var(--color-sun-text)] shadow-sm">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
