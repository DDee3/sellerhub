"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Globe, Palette, Store, ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/language-provider";
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
  const [rateDisplayMode, setRateDisplayMode] = useState<RateDisplayMode>(
    initialShop.rate_display_mode || "mmk_per_thb"
  );

  const [isPending, startTransition] = useTransition();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!initialShop.id || initialShop.id.trim() === "") {
      toast.error("Shop ID is missing. Please refresh the page.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("shops")
          .update({
            name: shopName.trim(),
            rate_display_mode: rateDisplayMode,
          })
          .eq("id", initialShop.id);

        if (error) {
          console.error("[Settings] Save error:", error);
          toast.error("Failed to save settings: " + error.message);
          return;
        }

        toast.success("Settings saved successfully");
        router.refresh();
      } catch (err) {
        console.error("[Settings] Unexpected error:", err);
        toast.error("Something went wrong saving settings");
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <Card className="bg-card text-card-foreground border-border overflow-hidden">
        {/* Section 1: Rate Display Mode */}
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Rate Display Mode
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
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
                  }
                }}
              >
                <SelectTrigger className="w-full h-9 rounded-md bg-background border-input text-xs">
                  <SelectValue placeholder="Select mode">
                    {rateDisplayModeLabels[rateDisplayMode]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-md">
                  <SelectItem value="mmk_per_thb" className="text-xs">
                    1 THB = X MMK
                  </SelectItem>
                  <SelectItem value="thb_per_lakh" className="text-xs">
                    1 Lakh MMK = X THB
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section 2: Shop Profile */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Shop Profile
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your store and workspace details
              </p>
            </div>
          </div>

          <div className="space-y-1.5 max-w-md pt-1">
            <Label htmlFor="shop-name" className="text-xs font-medium text-foreground">
              Shop Name
            </Label>
            <Input
              id="shop-name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. My Exchange Store"
              required
              className="h-9 rounded-md bg-background text-foreground border-input text-sm"
            />
          </div>
        </div>

        {/* Section 3: Language & Region */}
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Language
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
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
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-9 rounded-md bg-background border-input text-xs">
                    <SelectValue>
                      {languageLabels[language] || language}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="en" className="text-xs">English</SelectItem>
                    <SelectItem value="my" className="text-xs">မြန်မာ</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-9 rounded-md bg-muted/60 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Appearance */}
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Appearance
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select your interface theme
                </p>
              </div>
            </div>
            <div className="w-full sm:w-48 shrink-0">
              {mounted ? (
                <Select
                  value={theme || "system"}
                  onValueChange={(val) => {
                    if (val) setTheme(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 rounded-md bg-background border-input text-xs">
                    <SelectValue>
                      {themeLabels[theme || "system"] || theme}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-md">
                    <SelectItem value="light" className="text-xs">Light</SelectItem>
                    <SelectItem value="dark" className="text-xs">Dark</SelectItem>
                    <SelectItem value="system" className="text-xs">System</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-9 rounded-md bg-muted/60 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 text-xs font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save settings</span>
          )}
        </Button>
      </div>
    </form>
  );
}

export default SettingsForm;
