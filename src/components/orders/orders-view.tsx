"use client";

import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";

import { OrderFilters } from "@/components/orders/order-filters";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import type { OrderStatus, OrderType } from "@/types/database";

export interface OrderItem {
  id: string;
  order_type: OrderType;
  total_price: number;
  balance_due: number;
  status: OrderStatus;
  created_at: string;
  customer_name: string;
  items_count: number;
}

interface OrdersViewProps {
  orders: OrderItem[];
  searchQuery?: string;
  statusFilter?: string;
}

export function OrdersView({
  orders,
  searchQuery,
  statusFilter,
}: OrdersViewProps) {
  const { t } = useLanguage();

  function renderOrderStatusBadge(status: OrderStatus) {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {t("orders.status_pending")}
          </Badge>
        );
      case "confirmed":
        return (
          <Badge
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {t("orders.status_confirmed")}
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="border-emerald-600 text-emerald-600 bg-emerald-50/50 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {t("orders.status_delivered")}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="destructive"
            className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {t("orders.status_cancelled")}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {status}
          </Badge>
        );
    }
  }

  function renderOrderTypeBadge(type: OrderType) {
    if (type === "stock") {
      return (
        <Badge
          variant="default"
          className="text-[10px] px-1.5 py-0 h-4 font-normal"
        >
          {t("orders.badge_stock")}
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="text-[10px] px-1.5 py-0 h-4 font-normal"
      >
        {t("orders.badge_preorder")}
      </Badge>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("orders.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {orders.length} {t("orders.subtitle")}
          </p>
        </div>
        <Link
          href="/orders/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full sm:w-auto inline-flex items-center justify-center h-9 gap-1.5 px-4 text-sm font-semibold rounded-full shadow-soft hover:shadow-lift"
          )}
        >
          <Plus className="h-4 w-4" />
          {t("orders.add_button")}
        </Link>
      </div>

      {/* Filters */}
      <OrderFilters />

      {/* Empty state or Orders list */}
      {orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center bg-card border-border/60 rounded-2xl shadow-soft">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {t("orders.empty_title")}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {searchQuery || (statusFilter && statusFilter !== "all")
              ? t("orders.empty_search")
              : t("orders.empty_action")}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const initial = [...order.customer_name.trim()][0]?.toUpperCase() || "O";
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block group"
              >
                <div className="py-3 px-4 flex items-center gap-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors shadow-soft cursor-pointer">
                  {/* LEFT: 38px circle avatar */}
                  <div className="h-9.5 w-9.5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0 select-none">
                    {initial}
                  </div>

                  {/* MIDDLE */}
                  <div className="flex-1 min-w-0 text-left space-y-0.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {order.customer_name}
                      </span>
                      {renderOrderStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                      {renderOrderTypeBadge(order.order_type)}
                      <span>·</span>
                      <span>{order.items_count} {t("orders.items_suffix")}</span>
                      <span>·</span>
                      <MyanmarDate date={order.created_at} />
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-foreground tabular-nums leading-none">
                      {order.total_price.toLocaleString()} {t("currency")}
                    </p>
                    <div className="mt-1">
                      {order.balance_due > 0 ? (
                        <p className="text-xs text-amber-600 font-medium">
                          {t("orders.balance_due")} {order.balance_due.toLocaleString()} {t("currency")}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground font-medium">
                          {t("orders.paid_full")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersView;

