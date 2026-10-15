"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Home",
  },
  {
    href: "/products",
    icon: Package,
    label: "Products",
  },
  {
    href: "/orders",
    icon: ShoppingCart,
    label: "Orders",
  },
  {
    href: "/shipments",
    icon: Truck,
    label: "Shipments",
  },
  {
    href: "/customers",
    icon: Users,
    label: "Customers",
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 rounded-full border border-border bg-background/80 backdrop-blur-xl shadow-lift z-50 flex justify-around p-2 md:hidden">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "p-2 rounded-full hover:bg-muted active:scale-95 transition-transform flex items-center justify-center",
              isActive && "bg-primary/10 text-primary"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileNav;

