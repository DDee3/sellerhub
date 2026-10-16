"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Pencil, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { ShipmentStatus, UnassignedPreorderOrder } from "@/lib/queries/shipments";
import type { OrderStatus } from "@/lib/queries/orders";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { AssignOrdersButton } from "@/components/shipments/assign-orders-button";
import { ShipmentStatusActions } from "@/components/shipments/shipment-status-actions";
import { RemoveOrderButton } from "@/components/shipments/remove-order-button";
import { DeleteShipmentButton } from "@/components/shipments/delete-shipment-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

interface ShipmentOrder {
  id: string;
  customer_name: string;
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  status: OrderStatus;
  items_count: number;
}

interface ShipmentDetail {
  id: string;
  name: string;
  source: string | null;
  order_date: string | null;
  arrive_date: string | null;
  status: ShipmentStatus;
  total_cost: number | null;
  note: string | null;
  orders: ShipmentOrder[];
}

interface RawShipmentRow {
  id: string;
  name: string;
  source: string | null;
  order_date: string | null;
  arrive_date: string | null;
  status: ShipmentStatus;
  total_cost: number | null;
  note: string | null;
}

interface RawShipmentOrderRow {
  id: string;
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  status: string;
  customers: { name: string } | { name: string }[] | null;
  order_items: { id: string }[] | null;
}

interface RawUnassignedOrderRow {
  id: string;
  total_price: number;
  customers: { name: string } | { name: string }[] | null;
  order_items: { id: string }[] | null;
}

function ShipmentStatusBadge({
  status,
  t,
}: {
  status: ShipmentStatus;
  t: (key: string) => string;
}) {
  switch (status) {
    case "ordering":
      return <Badge variant="secondary">{t("shipments.status_ordering")}</Badge>;
    case "in_transit":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          {t("shipments.status_in_transit")}
        </Badge>
      );
    case "arrived":
      return (
        <Badge
          variant="outline"
          className="border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40"
        >
          {t("shipments.status_arrived")}
        </Badge>
      );
    case "delivering":
      return (
        <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">
          {t("shipments.status_delivering")}
        </Badge>
      );
    case "completed":
      return <Badge variant="outline">{t("shipments.status_completed")}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function OrderStatusBadge({
  status,
  t,
}: {
  status: OrderStatus;
  t: (key: string) => string;
}) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
          {t("orders.status_pending")}
        </Badge>
      );
    case "confirmed":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-[10px] px-1.5 py-0 h-5 font-normal">
          {t("orders.status_confirmed")}
        </Badge>
      );
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          {t("orders.status_delivered")}
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 font-normal">
          {t("orders.status_cancelled")}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
          {status}
        </Badge>
      );
  }
}

export default function ShipmentDetailPage({
  params,
}: ShipmentDetailPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [unassignedOrders, setUnassignedOrders] = useState<UnassignedPreorderOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      const supabase = createClient();
      const [sRes, oRes, uRes] = await Promise.all([
        supabase
          .from("shipments")
          .select<string, RawShipmentRow>(
            "id, name, source, order_date, arrive_date, status, total_cost, note"
          )
          .eq("id", id)
          .single(),
        supabase
          .from("orders")
          .select<string, RawShipmentOrderRow>(
            "id, total_price, deposit_paid, balance_due, status, customers(name), order_items(id)"
          )
          .eq("shipment_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select<string, RawUnassignedOrderRow>(
            "id, total_price, customers(name), order_items(id)"
          )
          .is("shipment_id", null)
          .eq("order_type", "preorder")
          .neq("status", "cancelled")
      ]);

      if (sRes.error || !sRes.data) {
        if (isMounted) notFound();
        return;
      }

      const ordersData = oRes.data || [];
      const mappedOrders: ShipmentOrder[] = ordersData.map((o) => {
        const cust = Array.isArray(o.customers) ? o.customers[0] : o.customers;
        let mappedStatus: OrderStatus = "pending";
        if (o.status === "confirmed" || o.status === "delivered" || o.status === "cancelled") {
          mappedStatus = o.status;
        } else if (o.status === "paid" || o.status === "packed" || o.status === "shipped") {
          mappedStatus = "confirmed";
        }
        return {
          id: o.id,
          customer_name: cust?.name || t("orders.detail.customer"),
          total_price: Number(o.total_price) || 0,
          deposit_paid: Number(o.deposit_paid) || 0,
          balance_due: Number(o.balance_due) || 0,
          status: mappedStatus,
          items_count: o.order_items?.length || 0,
        };
      });

      const mappedShipment: ShipmentDetail = {
        id: sRes.data.id,
        name: sRes.data.name,
        source: sRes.data.source,
        order_date: sRes.data.order_date,
        arrive_date: sRes.data.arrive_date,
        status: sRes.data.status,
        total_cost: sRes.data.total_cost,
        note: sRes.data.note,
        orders: mappedOrders,
      };

      const unassignedData = uRes.data || [];
      const mappedUnassigned: UnassignedPreorderOrder[] = unassignedData.map((o) => {
        const cust = Array.isArray(o.customers) ? o.customers[0] : o.customers;
        return {
          id: o.id,
          customer_name: cust?.name || t("orders.detail.customer"),
          total_price: Number(o.total_price) || 0,
          items_count: o.order_items?.length || 0,
        };
      });

      if (isMounted) {
        setShipment(mappedShipment);
        setUnassignedOrders(mappedUnassigned);
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!shipment) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/shipments"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-10 w-10 rounded-xl border-border bg-card text-foreground hover:bg-muted shadow-soft shrink-0"
            )}
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">{t("back")}</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {shipment.name}
              </h1>
              <ShipmentStatusBadge status={shipment.status} t={t} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {shipment.orders.length} {t("shipments.orders_suffix")} •{" "}
              {Number(shipment.total_cost || 0).toLocaleString()} {t("currency")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/shipments/${shipment.id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 rounded-xl border-border bg-card text-foreground hover:bg-muted shadow-soft"
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t("common.edit")}
          </Link>
          {shipment.orders.length === 0 && (
            <DeleteShipmentButton shipmentId={shipment.id} />
          )}
        </div>
      </div>

      {/* Shipment Status Actions */}
      <ShipmentStatusActions
        shipmentId={id}
        currentStatus={shipment.status}
      />

      {/* Card A: Info */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("shipments.detail.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 bg-muted/50 rounded-xl border border-border/60">
            <span className="text-xs text-muted-foreground block mb-1">
              {t("shipments.detail.source")}
            </span>
            <span className="font-medium text-foreground">
              {shipment.source || "—"}
            </span>
          </div>
          <div className="p-3.5 bg-muted/50 rounded-xl border border-border/60">
            <span className="text-xs text-muted-foreground block mb-1">
              {t("shipments.detail.total_cost")}
            </span>
            <span className="font-medium text-foreground">
              {Number(shipment.total_cost || 0).toLocaleString()} {t("currency")}
            </span>
          </div>
          <div className="p-3.5 bg-muted/50 rounded-xl border border-border/60">
            <span className="text-xs text-muted-foreground block mb-1">
              {t("shipments.detail.order_date")}
            </span>
            <span className="font-medium text-foreground">
              {shipment.order_date ? (
                <MyanmarDate date={shipment.order_date} />
              ) : (
                "—"
              )}
            </span>
          </div>
          <div className="p-3.5 bg-muted/50 rounded-xl border border-border/60">
            <span className="text-xs text-muted-foreground block mb-1">
              {t("shipments.detail.arrive_date")}
            </span>
            <span className="font-medium text-foreground">
              {shipment.arrive_date ? (
                <MyanmarDate date={shipment.arrive_date} />
              ) : (
                "—"
              )}
            </span>
          </div>
          {shipment.note && (
            <div className="sm:col-span-2 p-3.5 bg-muted/50 rounded-xl border border-border/60">
              <span className="text-xs text-muted-foreground block mb-1">
                {t("shipments.form.note")}
              </span>
              <p className="text-foreground whitespace-pre-wrap mt-0.5 text-sm">
                {shipment.note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card B: Orders */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("shipments.detail.orders")} ({shipment.orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {shipment.orders.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">
                {t("shipments.detail.no_orders")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shipment.orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition shadow-soft flex items-center justify-between gap-3 group"
                >
                  <Link
                    href={`/orders/${order.id}`}
                    className="min-w-0 flex-1 block"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground truncate group-hover:text-primary transition">
                        {order.customer_name}
                      </span>
                      <span className="font-semibold text-foreground shrink-0">
                        {Number(order.total_price).toLocaleString()} {t("currency")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {order.items_count} {t("orders.items_suffix")}
                        </span>
                        <OrderStatusBadge status={order.status} t={t} />
                      </div>
                      {order.balance_due > 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          {t("orders.balance_due")} {Number(order.balance_due).toLocaleString()} {t("currency")}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="shrink-0 pl-1 border-l border-border">
                    <RemoveOrderButton orderId={order.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card C: Assign Preorder Orders */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("shipments.assign.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <AssignOrdersButton
            shipmentId={shipment.id}
            unassignedOrders={unassignedOrders}
          />
        </CardContent>
      </Card>
    </div>
  );
}
