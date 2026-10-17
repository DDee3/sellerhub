"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { dictionary, type Language, type DictKey } from "@/lib/i18n/dictionary";

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: DictKey | string) => string;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "exchange-lang";

let memoryLang: Language = "en";

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "en" || saved === "my") {
      memoryLang = saved;
      return saved;
    }
  } catch {
    // localStorage may be restricted
  }
  return memoryLang;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<Language>(subscribe, getLanguageSnapshot, () => "en");
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const setLanguage = useCallback((newLang: Language) => {
    memoryLang = newLang;
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // localStorage may be unavailable
    }
    notify();
  }, []);

  const t = useCallback(
    (key: DictKey | string): string => {
      const dictForLang = dictionary[language] as Record<string, string> | undefined;
      const dictEn = dictionary["en"] as Record<string, string> | undefined;
      return dictForLang?.[key] ?? dictEn?.[key] ?? key;
    },
    [language]
  );

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      locale: language,
      setLocale: setLanguage,
      t,
      mounted,
    }),
    [language, setLanguage, t, mounted]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div key={language} className="contents">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
