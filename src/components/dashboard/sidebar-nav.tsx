"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ClipboardList,
  Users,
  Settings,
  Plus,
  LogOut,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { createClient } from "@/lib/supabase/client";
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
  const router = useRouter();
  const { t } = useLanguage();

  const [userProfile, setUserProfile] = useState<{
    shopName: string;
    email: string;
    initials: string;
  }>({
    shopName: "My Store",
    email: "Owner",
    initials: "SH",
  });
  const [todayProfit, setTodayProfit] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isMounted) return;

        const { data: shop } = await supabase
          .from("shops")
          .select("id, name")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const name = shop?.name || "My Store";
        const email = user.email || "Owner";
        const initials =
          name
            .trim()
            .split(" ")
            .map((p) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase() || "SH";

        if (isMounted) {
          setUserProfile({
            shopName: name,
            email,
            initials: initials || "SH",
          });
        }

        if (shop?.id) {
          const now = new Date();
          const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0,
            0
          ).toISOString();

          const { data: deals } = await supabase
            .from("deals")
            .select("profit_mmk")
            .eq("shop_id", shop.id)
            .gte("created_at", todayStart);

          if (deals && isMounted) {
            const sum = deals.reduce(
              (acc, d) => acc + (Number(d.profit_mmk) || 0),
              0
            );
            setTodayProfit(sum);
          }
        }
      } catch {
        // keep fallback values
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message || "Error logging out");
        return;
      }

      toast.success(t("logout") || "Logged out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Error logging out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen fixed left-0 top-0 bottom-0 w-56 border-r border-border/40 bg-sidebar select-none z-40",
        className
      )}
    >
      {/* 1. Top Section: Brand Logo */}
      <div className="h-12 flex items-center px-4 border-b border-border/40 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
          <span className="font-light text-lg tracking-[-0.64px] text-foreground lowercase">
            exchange
          </span>
        </Link>
      </div>

      {/* 2. Record Deal Button (without double plus) */}
      <div className="p-3 pb-2 shrink-0">
        <Link
          href="/deals/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full h-9 rounded-full text-xs font-normal shadow-stripi-1 gap-1.5 flex items-center justify-center"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record Deal</span>
        </Link>
      </div>

      {/* 3. Middle Section: Navigation & Mini Quick Stats Widget */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto px-2 py-1">
        <div>
          <div className="px-2 pt-2 pb-1 text-[10px] font-normal text-muted-foreground/80 uppercase tracking-[0.1px]">
            WORKSPACE
          </div>
          <nav className="flex flex-col gap-1">
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
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-normal"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span className="truncate">{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mini Quick Stats Card */}
        <div className="my-4 mx-1 p-3.5 rounded-xl border border-border/60 bg-muted/30 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-normal text-muted-foreground uppercase tracking-[0.1px]">
              Today&apos;s Profit
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-base font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {todayProfit !== null
              ? `${todayProfit > 0 ? "+ " : ""}${todayProfit.toLocaleString()} MMK`
              : "+ 1,500 MMK"}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: User Profile & Logout (pushed to bottom with mt-auto) */}
      <div className="mt-auto p-3 border-t border-border/40 shrink-0">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0 select-none border border-primary/20">
              {userProfile.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">
                {userProfile.shopName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate font-light">
                {userProfile.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={t("logout") || "Log out"}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span className="sr-only">{t("logout") || "Log out"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SidebarNav;
