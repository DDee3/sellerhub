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

const typeLabels: Record<string, string> = {
  all: "အားလုံး",
  stock: "လက်ကျန်",
  preorder: "ကြိုမှာ",
  hybrid: "နှစ်မျိုးရော",
};

const activeLabels: Record<string, string> = {
  all: "အားလုံး",
  active: "အသက်ဝင်",
  inactive: "မလှုပ်ရှား",
};

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          value={search}
          onChange={handleSearchChange}
          placeholder="ပစ္စည်း အမည် ရှာဖွေ..."
          className="h-11 pl-9 text-base bg-white border-slate-200"
        />
      </div>

      {/* Type filter */}
      <Select
        value={currentType}
        onValueChange={(value: string | null) =>
          updateParams({ type: value ?? "all" })
        }
      >
        <SelectTrigger className="h-11 w-full sm:w-[140px] bg-white border-slate-200 text-sm">
          <span>{typeLabels[currentType] ?? "အားလုံး"}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">အားလုံး</SelectItem>
          <SelectItem value="stock">လက်ကျန်</SelectItem>
          <SelectItem value="preorder">ကြိုမှာ</SelectItem>
          <SelectItem value="hybrid">နှစ်မျိုးရော</SelectItem>
        </SelectContent>
      </Select>

      {/* Active/inactive filter */}
      <Select
        value={currentActive}
        onValueChange={(value: string | null) =>
          updateParams({ active: value ?? "all" })
        }
      >
        <SelectTrigger className="h-11 w-full sm:w-[140px] bg-white border-slate-200 text-sm">
          <span>{activeLabels[currentActive] ?? "အားလုံး"}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">အားလုံး</SelectItem>
          <SelectItem value="active">အသက်ဝင်</SelectItem>
          <SelectItem value="inactive">မလှုပ်ရှား</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default ProductFilters;
