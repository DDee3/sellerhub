"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
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
  className?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function SidebarNav({
  shopName,
  onNavigate,
  className,
  isExpanded = true,
  onToggle,
}: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside
      className={cn(
        "!hidden md:!flex flex-col fixed left-4 top-4 bottom-4 rounded-3xl border border-border bg-background/80 backdrop-blur-xl shadow-lift z-50 p-4 transition-all duration-300 ease-in-out overflow-hidden justify-between select-none",
        isExpanded ? "w-64" : "w-20",
        className
      )}
    >
      {/* Top section: Brand / Logo toggle & Navigation */}
      <div className="space-y-6">
        {/* Clickable toggle to the logo area */}
        <button
          type="button"
          onClick={onToggle}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="w-full flex items-center justify-center md:justify-start gap-3 p-1 rounded-2xl transition-all duration-200 hover:opacity-90 group text-left outline-none"
        >
          <Image
            src="/logo.png"
            alt="SellerHub"
            width={40}
            height={40}
            className="rounded-xl object-contain shrink-0"
            priority
          />
          {isExpanded && (
            <div className="min-w-0 transition-opacity duration-200">
              <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
                SellerHub
              </h1>
              <p className="text-xs font-medium text-muted-foreground mt-1 truncate">
                {t("nav_dashboard")}
              </p>
            </div>
          )}
        </button>

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
                title={t(item.key)}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl transition-all duration-200 text-sm font-medium",
                  isExpanded ? "px-4 py-2.5 justify-start" : "h-11 w-11 mx-auto justify-center p-0",
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
                {isExpanded && <span className="truncate">{t(item.key)}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Shop info + Logout */}
      <div className="mt-auto pt-4 border-t border-border/60 space-y-2">
        {isExpanded ? (
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-muted/40 border border-border/40">
            <Avatar className="h-9 w-9 bg-primary/15 text-primary border border-primary/20 shrink-0">
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
        ) : (
          <div className="flex justify-center py-1">
            <Avatar className="h-9 w-9 bg-primary/15 text-primary border border-primary/20 shrink-0">
              <AvatarFallback className="font-semibold text-xs tracking-wider">
                {shopName ? shopName.slice(0, 2).toUpperCase() : "SH"}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <LogoutButton
          variant="ghost"
          isExpanded={isExpanded}
          className={cn(
            "text-sm font-medium rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            isExpanded ? "w-full justify-start" : "w-11 h-11 mx-auto justify-center"
          )}
        />
      </div>
    </aside>
  );
}

export default SidebarNav;
