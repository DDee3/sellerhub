"use client";

import Link from "next/link";
import { Plus, Truck } from "lucide-react";

import { ShipmentFilters } from "@/components/shipments/shipment-filters";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import type { ShipmentStatus } from "@/types/database";

export interface ShipmentItem {
  id: string;
  name: string;
  source: string | null;
  order_date: string | null;
  arrive_date: string | null;
  status: ShipmentStatus;
  total_cost: number | null;
  orders_count: number;
}

interface ShipmentsViewProps {
  shipments: ShipmentItem[];
  searchQuery?: string;
  statusFilter?: string;
}

export function ShipmentsView({
  shipments,
  searchQuery,
  statusFilter,
}: ShipmentsViewProps) {
  const { t } = useLanguage();

  function renderShipmentStatusBadge(status: ShipmentStatus) {
    switch (status) {
      case "ordering":
        return (
          <Badge
            variant="secondary"
            className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {t("shipments.status_ordering")}
          </Badge>
        );
      case "in_transit":
        return (
          <Badge
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {t("shipments.status_in_transit")}
          </Badge>
        );
      case "arrived":
        return (
          <Badge
            variant="outline"
            className="border-emerald-600 text-emerald-600 bg-emerald-50/50 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {t("shipments.status_arrived")}
          </Badge>
        );
      case "delivering":
        return (
          <Badge
            variant="default"
            className="bg-amber-600 hover:bg-amber-700 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {t("shipments.status_delivering")}
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
          >
            {t("shipments.status_completed")}
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

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("shipments.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {shipments.length} {t("shipments.subtitle")}
          </p>
        </div>
        <Link
          href="/shipments/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full sm:w-auto inline-flex items-center justify-center h-9 gap-1.5 px-4 text-sm font-semibold rounded-full shadow-soft hover:shadow-lift"
          )}
        >
          <Plus className="h-4 w-4" />
          {t("shipments.add_button")}
        </Link>
      </div>

      {/* Filters */}
      <ShipmentFilters />

      {/* Empty state or Shipments List */}
      {shipments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center bg-card border-border/60 rounded-2xl shadow-soft">
          <Truck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {t("shipments.empty_title")}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {searchQuery || (statusFilter && statusFilter !== "all")
              ? t("shipments.empty_search")
              : t("shipments.empty_action")}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {shipments.map((shipment) => (
            <Link
              key={shipment.id}
              href={`/shipments/${shipment.id}`}
              className="block group"
            >
              <div className="py-3 px-4 flex items-center gap-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors shadow-soft cursor-pointer">
                {/* LEFT: 38px rounded-xl with Truck icon */}
                <div className="h-9.5 w-9.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 select-none">
                  <Truck className="h-4 w-4 text-primary" />
                </div>

                {/* MIDDLE */}
                <div className="flex-1 min-w-0 text-left space-y-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {shipment.name}
                    </span>
                    {renderShipmentStatusBadge(shipment.status)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                    <span>
                      {shipment.source ? `${shipment.source} · ` : ""}
                      {shipment.orders_count} {t("shipments.orders_suffix")}
                    </span>
                    <span>•</span>
                    <span>{t("shipments.ordered")}</span>
                    {shipment.order_date ? (
                      <MyanmarDate date={shipment.order_date} />
                    ) : (
                      <span>—</span>
                    )}
                    <span>→</span>
                    <span>{t("shipments.arrived_label")}</span>
                    {shipment.arrive_date ? (
                      <MyanmarDate date={shipment.arrive_date} />
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-foreground tabular-nums leading-none">
                    {Number(shipment.total_cost || 0).toLocaleString()} {t("currency")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t("shipments.total_cost")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShipmentsView;

