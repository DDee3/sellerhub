"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Store,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    key: "nav_products",
    href: "/products",
    icon: Package,
  },
  {
    key: "nav_orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    key: "nav_shipments",
    href: "/shipments",
    icon: Truck,
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
  shopName?: string;
  onNavigate?: () => void;
}

export function SidebarNav({ shopName, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Top section: Brand & Navigation */}
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-200 hover:opacity-90 group select-none"
        >
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-soft transition-transform duration-200 group-hover:scale-105">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
              SellerHub
            </h1>
            <p className="text-xs font-medium text-muted-foreground mt-1 truncate">
              {t("nav_dashboard")}
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Shop info + Logout */}
      <div className="pt-4 border-t border-border/60 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-muted/40 border border-border/40">
          <Avatar className="h-9 w-9 bg-primary/15 text-primary border border-primary/20">
            <AvatarFallback className="font-semibold text-xs tracking-wider">
              {shopName ? shopName.slice(0, 2).toUpperCase() : "SH"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {shopName || "SellerHub Shop"}
            </p>
            <p className="text-xs text-muted-foreground truncate">Reseller Store</p>
          </div>
        </div>

        <LogoutButton
          variant="outline"
          className="w-full justify-center h-10 text-sm font-medium rounded-full hover:bg-muted"
        />
      </div>
    </div>
  );
}

export default SidebarNav;
