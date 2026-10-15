"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function SettingsHeader() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        {t("settings.title")}
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        {t("settings.subtitle")}
      </p>
    </div>
  );
}

