"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useLanguage } from "@/components/providers/language-provider";

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const typeLabels: Record<string, string> = {
    all: t("products.filter_all"),
    stock: t("products.filter_stock"),
    preorder: t("products.filter_preorder"),
    hybrid: t("products.filter_hybrid"),
  };

  const activeLabels: Record<string, string> = {
    all: t("products.filter_all"),
    active: t("products.filter_active"),
    inactive: t("products.filter_inactive"),
  };

  const currentQ = searchParams.get("q") ?? "";
  const currentType = searchParams.get("type") ?? "all";
  const currentActive = searchParams.get("active") ?? "all";

  const [search, setSearch] = useState(currentQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearch(currentQ);
  }, [currentQ]);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value });
    }, 300);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Search input */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={handleSearchChange}
          placeholder={t("products.search_placeholder")}
          className="h-10 pl-9 text-sm bg-card border-border rounded-xl"
        />
      </div>

      {/* Type filter */}
      <Select
        value={currentType}
        onValueChange={(value: string | null) =>
          updateParams({ type: value ?? "all" })
        }
      >
        <SelectTrigger className="h-10 w-full sm:w-[140px] bg-card border-border text-sm rounded-xl">
          <span>{typeLabels[currentType] ?? t("products.filter_all")}</span>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">{t("products.filter_all")}</SelectItem>
          <SelectItem value="stock">{t("products.filter_stock")}</SelectItem>
          <SelectItem value="preorder">{t("products.filter_preorder")}</SelectItem>
          <SelectItem value="hybrid">{t("products.filter_hybrid")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Active/inactive filter */}
      <Select
        value={currentActive}
        onValueChange={(value: string | null) =>
          updateParams({ active: value ?? "all" })
        }
      >
        <SelectTrigger className="h-10 w-full sm:w-[140px] bg-card border-border text-sm rounded-xl">
          <span>{activeLabels[currentActive] ?? t("products.filter_all")}</span>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">{t("products.filter_all")}</SelectItem>
          <SelectItem value="active">{t("products.filter_active")}</SelectItem>
          <SelectItem value="inactive">{t("products.filter_inactive")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default ProductFilters;
