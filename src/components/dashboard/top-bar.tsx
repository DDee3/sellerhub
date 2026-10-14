"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const routeTitles: Record<string, string> = {
  "/dashboard": "ပင်မစာမျက်နှာ",
  "/products": "ပစ္စည်းများ စီမံခန့်ခွဲမှု",
  "/orders": "အော်ဒါများ စီမံခန့်ခွဲမှု",
  "/shipments": "ပို့ဆောင်မှုများ စီမံခန့်ခွဲမှု",
  "/customers": "ဝယ်ယူသူများ စာရင်း",
};

export function TopBar({ shopName }: { shopName?: string }) {
  const pathname = usePathname();

  // Find matching title based on path prefix
  const matchedKey =
    Object.keys(routeTitles).find(
      (path) => pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
    ) || "/dashboard";

  const title = routeTitles[matchedKey] || "ပင်မစာမျက်နှာ";

  return (
    <header className="hidden md:flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-6 lg:px-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-slate-900 h-9 w-9"
          aria-label="အသိပေးချက်များ"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
        </Button>

        {/* User / Shop Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <Avatar className="h-8 w-8 bg-primary/10 text-primary">
            <AvatarFallback className="text-xs font-semibold">
              {shopName ? shopName.slice(0, 2).toUpperCase() : "SH"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-700 hidden lg:inline">
            {shopName}
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;

