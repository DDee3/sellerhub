"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Globe, Palette, Store, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage, type Language } from "@/components/providers/language-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-4xl">
      {/* 1. Language & Region */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{t("settings.language_region")}</CardTitle>
              <CardDescription className="text-xs">{t("settings.language_region_desc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="space-y-1.5 max-w-md">
            <Label htmlFor="language-select" className="text-xs font-medium">{t("settings.language")}</Label>
            {mounted ? (
              <Select
                value={selectedLang}
                onValueChange={(val) => {
                  if (val === "en" || val === "my") {
                    setSelectedLang(val);
                  }
                }}
              >
                <SelectTrigger id="language-select" className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="Select language">
                    {languageLabels[selectedLang] || selectedLang}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="my">မြန်မာ</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 w-full rounded-xl bg-muted/60 animate-pulse" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Appearance */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{t("settings.appearance")}</CardTitle>
              <CardDescription className="text-xs">{t("settings.appearance_desc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="space-y-1.5 max-w-md">
            <Label htmlFor="theme-select" className="text-xs font-medium">{t("settings.theme")}</Label>
            {mounted ? (
              <Select
                value={selectedTheme}
                onValueChange={(val) => {
                  if (val) setSelectedTheme(val);
                }}
              >
                <SelectTrigger id="theme-select" className="w-full h-10 rounded-xl">
                  <SelectValue placeholder="Select theme">
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
              <div className="h-10 w-full rounded-xl bg-muted/60 animate-pulse" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Shop Profile */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{t("settings.shop_profile")}</CardTitle>
              <CardDescription className="text-xs">{t("settings.shop_profile_desc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shop-name" className="text-xs font-medium">{t("settings.shop_name")}</Label>
              <Input
                id="shop-name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={t("settings.shop_name_placeholder")}
                required
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-phone" className="text-xs font-medium">{t("settings.phone")}</Label>
              <Input
                id="shop-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("settings.phone_placeholder")}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shop-fb" className="text-xs font-medium">{t("settings.facebook_url")}</Label>
              <Input
                id="shop-fb"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder={t("settings.facebook_placeholder")}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-tg" className="text-xs font-medium">{t("settings.telegram_username")}</Label>
              <Input
                id="shop-tg"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                placeholder={t("settings.telegram_placeholder")}
                className="h-10 rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end mt-6">
        <Button
          type="submit"
          variant="premium"
          size="lg"
          disabled={isPending}
          className="min-w-36 gap-2 shadow-soft hover:shadow-lift font-semibold"
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

