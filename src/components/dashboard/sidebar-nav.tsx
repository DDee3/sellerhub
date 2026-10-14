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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  {
    name: "ပင်မစာမျက်နှာ",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "ပစ္စည်းများ",
    href: "/products",
    icon: Package,
  },
  {
    name: "အော်ဒါများ",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    name: "ပို့ဆောင်မှုများ",
    href: "/shipments",
    icon: Truck,
  },
  {
    name: "ဝယ်ယူသူများ",
    href: "/customers",
    icon: Users,
  },
];

interface SidebarNavProps {
  shopName?: string;
  onNavigate?: () => void;
}

export function SidebarNav({ shopName, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Top section: Brand & Navigation */}
      <div className="space-y-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              SellerHub
            </h1>
            <p className="text-xs text-slate-500 mt-1">စီမံခန့်ခွဲမှုစနစ်</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-slate-500"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Shop info + Logout */}
      <div className="pt-4 border-t border-slate-200/80 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar className="h-9 w-9 bg-primary/10 text-primary">
            <AvatarFallback className="font-semibold text-sm">
              {shopName ? shopName.slice(0, 2).toUpperCase() : "SH"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {shopName || "ကျွန်ုပ်၏ဆိုင်"}
            </p>
            <p className="text-xs text-slate-500">အရောင်းဆိုင်ပိုင်ရှင်</p>
          </div>
        </div>

        <LogoutButton
          variant="outline"
          className="w-full justify-center h-10 text-sm font-medium border-slate-200"
        />
      </div>
    </div>
  );
}

export default SidebarNav;

