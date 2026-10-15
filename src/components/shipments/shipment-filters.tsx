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

const statusLabels: Record<string, string> = {
  all: "အားလုံး",
  ordering: "မှာယူနေ",
  in_transit: "လမ်းပေါ်",
  arrived: "ရောက်ပြီ",
  delivering: "ပို့နေ",
  completed: "ပြီးစီး",
};

export function ShipmentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          value={search}
          onChange={handleSearchChange}
          placeholder="ပို့ဆောင်မှု အမည် ရှာဖွေ..."
          className="h-11 pl-9 text-base bg-white border-slate-200"
        />
      </div>

      {/* Status filter */}
      <Select
        value={currentStatus}
        onValueChange={(value: string | null) =>
          updateParams({ status: value ?? "all" })
        }
      >
        <SelectTrigger className="h-11 w-full sm:w-[140px] bg-white border-slate-200 text-sm">
          <span>{statusLabels[currentStatus] ?? "အားလုံး"}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">အားလုံး</SelectItem>
          <SelectItem value="ordering">မှာယူနေ</SelectItem>
          <SelectItem value="in_transit">လမ်းပေါ်</SelectItem>
          <SelectItem value="arrived">ရောက်ပြီ</SelectItem>
          <SelectItem value="delivering">ပို့နေ</SelectItem>
          <SelectItem value="completed">ပြီးစီး</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
