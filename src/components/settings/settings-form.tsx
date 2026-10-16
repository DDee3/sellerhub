"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Globe, Palette, Store, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage, type Language } from "@/components/providers/language-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export interface ShopData {
  id: string;
  name: string;
  phone: string | null;
  facebook_url: string | null;
  telegram_username?: string | null;
}

interface SettingsFormProps {
  initialShop: ShopData;
}

const languageLabels: Record<string, string> = {
  en: "English",
  my: "မြန်မာ",
};

const themeLabels: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function SettingsForm({ initialShop }: SettingsFormProps) {
  const router = useRouter();
  const { language, setLanguage, t, mounted } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [selectedTheme, setSelectedTheme] = useState<string>(theme || "system");
  const [shopName, setShopName] = useState<string>(initialShop.name || "");
  const [phone, setPhone] = useState<string>(initialShop.phone || "");
  const [facebookUrl, setFacebookUrl] = useState<string>(initialShop.facebook_url || "");
  const [telegramUsername, setTelegramUsername] = useState<string>(
    initialShop.telegram_username || ""
  );

  // Sync dropdown values if language or theme change externally
  useEffect(() => {
    setSelectedLang(language);
  }, [language]);

  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [theme]);

  const [isPending, startTransition] = useTransition();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        // 1. Update language state & localStorage immediately
        setLanguage(selectedLang);

        // 2. Update theme immediately
        setTheme(selectedTheme);

        // 3. Update shop profile in Supabase
        const supabase = createClient();
        const { error } = await supabase
          .from("shops")
          .update({
            name: shopName.trim(),
            phone: phone.trim() || null,
            facebook_url: facebookUrl.trim() || null,
            telegram_username: telegramUsername.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialShop.id);

        if (error) {
          toast.error(t("settings.saved_error"));
          return;
        }

        toast.success(t("settings.saved_success"));
        router.refresh();
      } catch {
        toast.error(t("settings.saved_error"));
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <Card className="bg-card text-card-foreground border-border shadow-soft overflow-hidden">
        {/* Section 1: Language & Region */}
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("settings.language_region")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("settings.language_region_desc")}
                </p>
              </div>
            </div>
            {/* Right-aligned control on desktop */}
            <div className="w-full sm:w-48 shrink-0">
              {mounted ? (
                <Select
                  value={selectedLang}
                  onValueChange={(val) => {
                    if (val === "en" || val === "my") {
                      setSelectedLang(val);
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-9 rounded-lg bg-background border-input text-sm">
                    <SelectValue>
                      {languageLabels[selectedLang] || selectedLang}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="my">မြန်မာ</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-9 rounded-lg bg-muted/60 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Appearance */}
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("settings.appearance")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("settings.appearance_desc")}
                </p>
              </div>
            </div>
            {/* Right-aligned control on desktop */}
            <div className="w-full sm:w-48 shrink-0">
              {mounted ? (
                <Select
                  value={selectedTheme}
                  onValueChange={(val) => {
                    if (val) setSelectedTheme(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 rounded-lg bg-background border-input text-sm">
                    <SelectValue>
                      {themeLabels[selectedTheme] || selectedTheme}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-9 rounded-lg bg-muted/60 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Shop Profile */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("settings.shop_profile")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("settings.shop_profile_desc")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="shop-name" className="text-xs font-medium text-foreground">
                {t("settings.shop_name")}
              </Label>
              <Input
                id="shop-name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={t("settings.shop_name_placeholder")}
                required
                className="h-9 rounded-lg bg-background text-foreground border-input text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-phone" className="text-xs font-medium text-foreground">
                {t("settings.phone")}
              </Label>
              <Input
                id="shop-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("settings.phone_placeholder")}
                className="h-9 rounded-lg bg-background text-foreground border-input text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-fb" className="text-xs font-medium text-foreground">
                {t("settings.facebook_url")}
              </Label>
              <Input
                id="shop-fb"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder={t("settings.facebook_placeholder")}
                className="h-9 rounded-lg bg-background text-foreground border-input text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-tg" className="text-xs font-medium text-foreground">
                {t("settings.telegram_username")}
              </Label>
              <Input
                id="shop-tg"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                placeholder={t("settings.telegram_placeholder")}
                className="h-9 rounded-lg bg-background text-foreground border-input text-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          variant="premium"
          size="default"
          disabled={isPending}
          className="min-w-32 gap-2 shadow-soft hover:shadow-lift font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("settings.saving")}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>{t("settings.save_button")}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
