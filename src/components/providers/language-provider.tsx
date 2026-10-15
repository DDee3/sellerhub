"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
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

const STORAGE_KEY = "sellerhub-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("my");
  const [mounted, setMounted] = useState(false);

  // Read saved language from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === "en" || saved === "my") {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // localStorage may be unavailable
    }
    setMounted(true);
  }, []);

  // Update state, localStorage, and html lang immediately
  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const t = useCallback(
    (key: DictKey | string): string => {
      const dictForLang = dictionary[language] as Record<string, string> | undefined;
      return dictForLang?.[key] ?? (dictionary.en as Record<string, string>)[key] ?? key;
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
