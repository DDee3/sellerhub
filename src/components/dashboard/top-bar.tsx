"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserAvatarDropdown } from "@/components/dashboard/user-avatar-dropdown";
import { useLanguage } from "@/components/providers/language-provider";
import type { DictKey } from "@/lib/i18n/dictionary";

const routeKeys: Record<string, DictKey> = {
  "/dashboard": "nav_dashboard",
  /* nav_deals placeholder - will be added in a later step */
  "/customers": "nav_customers",
  "/settings": "nav_settings",
};

export function TopBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const matchedKey =
    Object.keys(routeKeys).find(
      (path) => pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
    ) || "/dashboard";

  const title = t(routeKeys[matchedKey] || "nav_dashboard");

  return (
    <header className="hidden md:flex h-14 items-center justify-between border-b border-border bg-background px-6 sticky top-0 z-30">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserAvatarDropdown />
      </div>
    </header>
  );
}

export default TopBar;
