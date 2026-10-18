"use client";

import { usePathname } from "next/navigation";
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
        {/* Theme Toggle */}
        <div className="flex items-center bg-muted/50 p-1 rounded-full border border-border/50 shadow-soft">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
