"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ClipboardList,
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
  {
    key: "nav_deals",
    href: "/deals",
    icon: ArrowLeftRight,
  },
  {
    key: "nav_rate_card",
    href: "/rates",
    icon: ClipboardList,
  },
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
        "fixed left-0 top-0 bottom-0 w-56 border-r border-border bg-sidebar flex flex-col justify-between select-none z-40",
        className
      )}
    >
      {/* Top Section */}
      <div>
        {/* Brand */}
        <div className="h-12 flex items-center px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            <span className="font-light text-lg tracking-[-0.64px] text-foreground lowercase">
              exchange
            </span>
          </Link>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-5 pb-1.5 text-[10px] font-normal text-muted-foreground uppercase tracking-[0.1px]">
          WORKSPACE
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col py-1 gap-0.5 px-2">
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
                  "flex items-center gap-3 px-3 py-2 text-[14px] rounded-full transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-normal"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted font-light"
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
