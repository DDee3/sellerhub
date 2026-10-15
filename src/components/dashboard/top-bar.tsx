"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLanguage } from "@/components/providers/language-provider";
import type { DictKey } from "@/lib/i18n/dictionary";

const routeKeys: Record<string, DictKey> = {
  "/dashboard": "nav_dashboard",
  "/products": "nav_products",
  "/orders": "nav_orders",
  "/shipments": "nav_shipments",
  "/customers": "nav_customers",
  "/settings": "nav_settings",
};

export function TopBar({ shopName }: { shopName?: string }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Find matching title based on path prefix
  const matchedKey =
    Object.keys(routeKeys).find(
      (path) => pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
    ) || "/dashboard";

  const title = t(routeKeys[matchedKey] || "nav_dashboard");

  return (
    <header className="hidden md:flex h-16 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-6 lg:px-8 sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Unified Control Bar: Theme & Notification */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50 shadow-soft">
          <ThemeToggle />

          {/* Notification bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground h-9 w-9 rounded-full active:scale-95 transition-all duration-200"
            aria-label="အသိပေးချက်များ"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Button>
        </div>

        {/* User / Shop Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-border/60">
          <Avatar className="h-9 w-9 bg-primary/10 text-primary border border-primary/20 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
            <AvatarFallback className="text-xs font-semibold">
              {shopName ? shopName.slice(0, 2).toUpperCase() : "SH"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground hidden lg:inline">
            {shopName}
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
