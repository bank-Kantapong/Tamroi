"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_LOCALE, dictionary, type Locale } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (typeof dictionary)[Locale];
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: dictionary[DEFAULT_LOCALE],
});

const STORAGE_KEY = "tamroi_locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "th" || saved === "en") {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      } else {
        document.documentElement.lang = DEFAULT_LOCALE;
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      // ignore storage errors
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t: dictionary[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

