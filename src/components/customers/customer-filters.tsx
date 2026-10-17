"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/providers/language-provider";

export function CustomerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const currentQ = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(currentQ);
  const [prevQ, setPrevQ] = useState(currentQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (prevQ !== currentQ) {
    setPrevQ(currentQ);
    setSearch(currentQ);
  }

  const updateParams = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!q.trim()) {
        params.delete("q");
      } else {
        params.set("q", q.trim());
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
      updateParams(value);
    }, 300);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={handleSearchChange}
          placeholder={t("customers.search_placeholder")}
          className="h-10 pl-9 text-[15px] font-light bg-card border-input rounded-[6px]"
        />
      </div>
    </div>
  );
}

export default CustomerFilters;
