"use client";

import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage, mounted } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="flex h-9 w-[86px] shrink-0 items-center rounded-full border border-border/60 bg-muted/60 p-0.5 text-xs font-semibold shadow-soft select-none transition-all duration-200"
    >
      <button
        type="button"
        disabled={!mounted}
        onClick={() => setLanguage("my")}
        className={cn(
          "flex-1 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-bold",
          (mounted ? language === "my" : true)
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="မြန်မာ (MY)"
        title="မြန်မာ (MY)"
      >
        MY
      </button>
      <button
        type="button"
        disabled={!mounted}
        onClick={() => setLanguage("en")}
        className={cn(
          "flex-1 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 text-xs font-bold",
          mounted && language === "en"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="English (EN)"
        title="English (EN)"
      >
        EN
      </button>
    </div>
  );
}

export default LanguageToggle;
