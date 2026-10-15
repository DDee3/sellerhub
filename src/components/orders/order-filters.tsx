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

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const statusLabels: Record<string, string> = {
    all: t("all"),
    pending: t("orders.status_pending"),
    confirmed: t("orders.status_confirmed"),
    delivered: t("orders.status_delivered"),
    cancelled: t("orders.status_cancelled"),
  };

  const currentQ = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";

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
          placeholder={t("orders.search_placeholder")}
          className="h-10 pl-9 text-sm bg-card border-border rounded-xl"
        />
      </div>

      {/* Status filter */}
      <Select
        value={currentStatus}
        onValueChange={(value: string | null) =>
          updateParams({ status: value ?? "all" })
        }
      >
        <SelectTrigger className="h-10 w-full sm:w-[140px] bg-card border-border text-sm rounded-xl">
          <span>{statusLabels[currentStatus] ?? t("all")}</span>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">{t("all")}</SelectItem>
          <SelectItem value="pending">{t("orders.status_pending")}</SelectItem>
          <SelectItem value="confirmed">{t("orders.status_confirmed")}</SelectItem>
          <SelectItem value="delivered">{t("orders.status_delivered")}</SelectItem>
          <SelectItem value="cancelled">{t("orders.status_cancelled")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default OrderFilters;
