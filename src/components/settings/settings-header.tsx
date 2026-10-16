"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function SettingsHeader() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {t("settings.title")}
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        {t("settings.subtitle")}
      </p>
    </div>
  );
}

