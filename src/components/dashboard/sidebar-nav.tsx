"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
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

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 w-60 border-r border-border bg-sidebar flex flex-col justify-between select-none z-40",
        className
      )}
    >
      {/* Top Section */}
      <div>
        {/* Brand */}
        <div className="h-14 flex items-center px-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-foreground lowercase">
              exchange
            </span>
          </Link>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          WORKSPACE
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col py-1">
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
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-l-3",
                  isActive
                    ? "border-primary bg-muted font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Logout */}
      <div className="p-3 border-t border-border">
        <LogoutButton className="w-full justify-start text-xs text-muted-foreground hover:text-foreground" />
      </div>
    </aside>
  );
}

export default SidebarNav;
