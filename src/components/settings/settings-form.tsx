"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Globe, Palette, Store, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/language-provider";
import { Card } from "@/components/ui/card";
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

export type RateDisplayMode = "mmk_per_thb" | "thb_per_lakh";

export interface ShopData {
  id: string;
  name: string;
  rate_display_mode?: RateDisplayMode | null;
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

const rateDisplayModeLabels: Record<RateDisplayMode, string> = {
  mmk_per_thb: "1 THB = X MMK",
  thb_per_lakh: "1 Lakh MMK = X THB",
};

export function SettingsForm({ initialShop }: SettingsFormProps) {
  const router = useRouter();
  const { language, setLanguage, mounted } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [shopName, setShopName] = useState<string>(initialShop.name || "");
  const [lastSavedShopName, setLastSavedShopName] = useState<string>(
    initialShop.name || ""
  );
  const [rateDisplayMode, setRateDisplayMode] = useState<RateDisplayMode>(
    initialShop.rate_display_mode || "mmk_per_thb"
  );

  const updateShop = async (
    updates: {
      name?: string;
      rate_display_mode?: RateDisplayMode;
    },
    successMessage: string = "Settings saved"
  ) => {
    if (!initialShop.id || initialShop.id.trim() === "") {
      toast.error("Shop ID is missing. Please refresh the page.");
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("shops")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialShop.id);

      if (error) {
        console.error("[Settings] Auto-save error:", error);
        toast.error("Failed to save: " + error.message);
        return;
      }

      toast.success(successMessage);
      router.refresh();
    } catch (err) {
      console.error("[Settings] Unexpected error:", err);
      toast.error("Something went wrong saving settings");
    }
  };

  const handleShopNameBlur = () => {
    const trimmed = shopName.trim();
    if (!trimmed) {
      toast.error("Shop name cannot be empty");
      setShopName(lastSavedShopName);
      return;
    }

    if (trimmed !== lastSavedShopName) {
      setLastSavedShopName(trimmed);
      updateShop({ name: trimmed }, "Shop name saved");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card text-card-foreground border-border rounded-xl shadow-stripi-1 overflow-hidden">
        {/* Section 1: Rate Display Mode */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-normal text-foreground tracking-[-0.2px]">
                  Rate Display Mode
                </h3>
                <p className="text-xs font-light text-muted-foreground mt-0.5">
                  Select how exchange rates are entered and displayed
                </p>
              </div>
            </div>
            <div className="w-full sm:w-64 shrink-0">
              <Select
                value={rateDisplayMode}
                onValueChange={(val) => {
                  if (val === "mmk_per_thb" || val === "thb_per_lakh") {
                    setRateDisplayMode(val);
                    updateShop(
                      { rate_display_mode: val },
                      "Rate display mode saved"
                    );
                  }
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-[6px] bg-card border-input text-xs font-light">
                  <SelectValue placeholder="Select mode">
                    {rateDisplayModeLabels[rateDisplayMode]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="mmk_per_thb" className="text-xs font-light">
                    1 THB = X MMK
                  </SelectItem>
                  <SelectItem value="thb_per_lakh" className="text-xs font-light">
                    1 Lakh MMK = X THB
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section 2: Shop Profile */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-normal text-foreground tracking-[-0.2px]">
                Shop Profile
              </h3>
              <p className="text-xs font-light text-muted-foreground mt-0.5">
                Your store and workspace details
              </p>
            </div>
          </div>

          <div className="space-y-1.5 max-w-md pt-1">
            <Label htmlFor="shop-name" className="text-[13px] font-normal text-foreground">
              Shop Name
            </Label>
            <Input
              id="shop-name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              onBlur={handleShopNameBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              placeholder="e.g. My Exchange Store"
              required
              className="h-10 rounded-[6px] bg-card text-foreground border-input text-[15px] font-light"
            />
          </div>
        </div>

        {/* Section 3: Language & Region */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-normal text-foreground tracking-[-0.2px]">
                  Language
                </h3>
                <p className="text-xs font-light text-muted-foreground mt-0.5">
                  Display language for dashboard and menus
                </p>
              </div>
            </div>
            <div className="w-full sm:w-48 shrink-0">
              {mounted ? (
                <Select
                  value={language}
                  onValueChange={(val) => {
                    if (val === "en" || val === "my") {
                      setLanguage(val);
                      updateShop({}, "Language saved");
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-10 rounded-[6px] bg-card border-input text-xs font-light">
                    <SelectValue>
                      {languageLabels[language] || language}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="en" className="text-xs font-light">English</SelectItem>
                    <SelectItem value="my" className="text-xs font-light">မြန်မာ</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 rounded-[6px] bg-muted/60 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Appearance */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-normal text-foreground tracking-[-0.2px]">
                  Appearance
                </h3>
                <p className="text-xs font-light text-muted-foreground mt-0.5">
                  Select your interface theme
                </p>
              </div>
            </div>
            <div className="w-full sm:w-48 shrink-0">
              {mounted ? (
                <Select
                  value={theme || "system"}
                  onValueChange={(val) => {
                    if (val) {
                      setTheme(val);
                      updateShop({}, "Appearance saved");
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-10 rounded-[6px] bg-card border-input text-xs font-light">
                    <SelectValue>
                      {themeLabels[theme || "system"] || theme}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="light" className="text-xs font-light">Light</SelectItem>
                    <SelectItem value="dark" className="text-xs font-light">Dark</SelectItem>
                    <SelectItem value="system" className="text-xs font-light">System</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 rounded-[6px] bg-muted/60 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SettingsForm;
