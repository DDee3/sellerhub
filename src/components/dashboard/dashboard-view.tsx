"use client";

import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  ArrowRight,
  Plus,
  Inbox,
} from "lucide-react";

import type { DashboardStats } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { Greeting } from "@/components/dashboard/greeting";
import { useLanguage } from "@/components/providers/language-provider";

interface UpcomingShipment {
  id: string;
  name: string;
  arrive_date: string | null;
  status: string;
  source: string | null;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock_qty: number;
  low_stock_alert: number;
  image_url: string | null;
  price: number;
}

interface DashboardViewProps {
  shop: { id: string; name: string };
  stats: DashboardStats;
  upcomingShipments: UpcomingShipment[];
  lowStockProducts: LowStockProduct[];
}

export function DashboardView({
  shop,
  stats,
  upcomingShipments,
  lowStockProducts,
}: DashboardViewProps) {
  const { t, language } = useLanguage();

  function getShipmentStatusBadge(status: string) {
    switch (status) {
      case "ordering":
        return <Badge variant="secondary">{t("shipment.ordering")}</Badge>;
      case "in_transit":
        return <Badge variant="info">{t("shipment.in_transit")}</Badge>;
      case "arrived":
        return <Badge variant="success">{t("shipment.arrived")}</Badge>;
      case "delivering":
        return <Badge variant="warning">{t("shipment.delivering")}</Badge>;
      case "completed":
        return <Badge variant="muted">{t("shipment.completed")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div key={language} className="space-y-6 pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            <Greeting name={shop.name} />
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            <MyanmarDate />
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 pt-1 sm:pt-0">
          <Link
            href="/orders/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "gap-2 h-10 px-5 font-semibold rounded-full shadow-soft hover:shadow-lift"
            )}
          >
            <Plus className="h-4 w-4" />
            {t("dashboard.new_order")}
          </Link>
          <Link
            href="/shipments/new"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "gap-2 h-10 px-5 font-semibold rounded-full shadow-soft hover:shadow-lift bg-background"
            )}
          >
            <Plus className="h-4 w-4" />
            {t("dashboard.new_shipment")}
          </Link>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {/* Active Shipments */}
        <Card className="rounded-2xl border-border/60 bg-card p-1 shadow-soft" hoverLift>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t("dashboard.active_shipments")}
            </CardTitle>
            <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Truck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {stats.activeShipments}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {t("dashboard.active_shipments_sub")}
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="rounded-2xl border-border/60 bg-card p-1 shadow-soft" hoverLift>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t("dashboard.pending_orders")}
            </CardTitle>
            <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {stats.pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {t("dashboard.pending_orders_sub")}
            </p>
          </CardContent>
        </Card>

        {/* Unpaid Balance */}
        <Card className="rounded-2xl border-border/60 bg-card p-1 shadow-soft" hoverLift>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {t("dashboard.unpaid_balance")}
            </CardTitle>
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-bold leading-none">MMK</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground tabular-nums truncate">
              {stats.unpaidBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {t("dashboard.unpaid_balance_sub")}
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="rounded-2xl border-border/60 bg-card p-1 shadow-soft" hoverLift>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t("dashboard.low_stock")}
            </CardTitle>
            <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {stats.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {t("dashboard.low_stock_sub")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Two column grid on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upcoming Shipments */}
        <Card className="rounded-2xl border-border/60 bg-card shadow-soft flex flex-col" hoverLift>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {t("dashboard.upcoming_shipments")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.upcoming_shipments_sub")}
              </p>
            </div>
            <Link
              href="/shipments"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
            >
              {t("dashboard.view_all")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {upcomingShipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/60 mb-3 shadow-inner">
                  <Inbox className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {t("dashboard.no_shipments_today")}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {t("dashboard.no_shipments_sub")}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {upcomingShipments.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors rounded-xl cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("dashboard.arrive_date")}: {s.arrive_date || t("dashboard.not_set")}
                        {s.source ? ` • (${s.source})` : ""}
                      </p>
                    </div>
                    <div>{getShipmentStatusBadge(s.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Low Stock Products */}
        <Card className="rounded-2xl border-border/60 bg-card shadow-soft flex flex-col" hoverLift>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {t("dashboard.low_stock_title")}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.low_stock_title_sub")}
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
            >
              {t("dashboard.view_all")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/60 mb-3 shadow-inner">
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {t("dashboard.no_shipments_today")}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {t("dashboard.no_low_stock")}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors rounded-xl cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("dashboard.alert_threshold")}: {p.low_stock_alert} {t("dashboard.units")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="destructive"
                        className="font-semibold text-xs px-2.5 py-0.5"
                      >
                        {t("dashboard.remaining")} {p.stock_qty} {t("dashboard.units")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardView;
