"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import type { DictKey } from "@/lib/i18n/dictionary";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  key: DictKey;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    key: "nav_dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  /* nav_deals placeholder - will be added in a later step */
  {
    key: "nav_customers",
    href: "/customers",
    icon: Users,
  },
  {
    key: "nav_settings",
    href: "/settings",
    icon: Settings,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-14 border-t border-border bg-background items-center justify-around z-40 select-none">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 text-[11px] font-medium transition-colors",
              isActive
                ? "text-primary border-t-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileNav;
