"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { OrderPaymentEditor } from "@/components/orders/order-payment-editor";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/queries/orders";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface OrderDetail {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_facebook: string | null;
  order_type: "stock" | "preorder";
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  payment_method: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
  shipment_id: string | null;
  items: OrderItem[];
}

interface RawOrderDetailRow {
  id: string;
  customer_id: string;
  shipment_id: string | null;
  order_type: "stock" | "preorder";
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  payment_method: string;
  status: string;
  note: string | null;
  created_at: string;
  customers:
    | {
        name: string;
        phone: string | null;
        facebook_name: string | null;
      }
    | {
        name: string;
        phone: string | null;
        facebook_name: string | null;
      }[]
    | null;
  order_items:
    | {
        id: string;
        product_name: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
      }[]
    | null;
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
      return <Badge variant="secondary">{t("orders.status_pending")}</Badge>;
    case "confirmed":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          {t("orders.status_confirmed")}
        </Badge>
      );
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40"
        >
          {t("orders.status_delivered")}
        </Badge>
      );
    case "cancelled":
      return <Badge variant="destructive">{t("orders.status_cancelled")}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function OrderTypeBadge({
  type,
  t,
}: {
  type: "stock" | "preorder";
  t: (key: string) => string;
}) {
  if (type === "stock") {
    return <Badge variant="default">{t("orders.badge_stock")}</Badge>;
  }
  return <Badge variant="secondary">{t("orders.badge_preorder")}</Badge>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrder() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select<string, RawOrderDetailRow>(`
          id,
          order_type,
          total_price,
          deposit_paid,
          balance_due,
          payment_method,
          status,
          note,
          created_at,
          shipment_id,
          customer_id,
          customers (
            name,
            phone,
            facebook_name
          ),
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        if (isMounted) notFound();
        return;
      }

      const customer = Array.isArray(data.customers)
        ? data.customers[0]
        : data.customers;

      const rawItems = data.order_items || [];

      const rawStatus = data.status;
      let mappedStatus: OrderStatus = "pending";
      if (rawStatus === "confirmed" || rawStatus === "delivered" || rawStatus === "cancelled") {
        mappedStatus = rawStatus;
      } else if (rawStatus === "paid" || rawStatus === "packed" || rawStatus === "shipped") {
        mappedStatus = "confirmed";
      }

      const mappedOrder: OrderDetail = {
        id: data.id,
        customer_id: data.customer_id,
        customer_name: customer?.name || t("orders.detail.customer"),
        customer_phone: customer?.phone || null,
        customer_facebook: customer?.facebook_name || null,
        order_type: data.order_type,
        total_price: Number(data.total_price) || 0,
        deposit_paid: Number(data.deposit_paid) || 0,
        balance_due: Number(data.balance_due) || 0,
        payment_method: data.payment_method,
        status: mappedStatus,
        note: data.note,
        created_at: data.created_at,
        shipment_id: data.shipment_id,
        items: rawItems.map((item) => ({
          id: item.id,
          product_name: item.product_name,
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price) || 0,
          subtotal: Number(item.subtotal) || 0,
        })),
      };

      if (isMounted) {
        setOrder(mappedOrder);
        setLoading(false);
      }
    }

    fetchOrder();

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

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header with back button, status Badge & Edit button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/orders"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-10 w-10 rounded-xl border-border bg-card text-foreground hover:bg-muted shadow-soft shrink-0"
            )}
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">{t("back")}</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("orders.detail.title")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              #{order.id.slice(0, 8)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} t={t} />
        </div>

        <Link
          href={`/orders/${id}/edit`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 font-medium text-muted-foreground hover:text-foreground shrink-0"
          )}
        >
          <Pencil className="h-4 w-4" />
          {t("common.edit")}
        </Link>
      </div>

      {/* Card A: Customer */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("orders.detail.customer")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-muted/50 rounded-xl p-3.5 border border-border/60 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("orders.detail.name")}</span>
              <span className="font-medium text-foreground">
                {order.customer_name}
              </span>
            </div>
            {order.customer_phone && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("orders.detail.phone")}</span>
                <a
                  href={`tel:${order.customer_phone}`}
                  className="text-foreground font-medium hover:underline"
                >
                  {order.customer_phone}
                </a>
              </div>
            )}
            {order.customer_facebook && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("orders.detail.facebook")}</span>
                <span className="text-foreground">{order.customer_facebook}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card B: Order Info */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("orders.detail.order_info")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-sm">
          <div className="bg-muted/50 rounded-xl p-3.5 border border-border/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("orders.detail.order_type")}</span>
              <OrderTypeBadge type={order.order_type} t={t} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("orders.detail.order_date")}</span>
              <span className="text-foreground font-medium">
                <MyanmarDate date={order.created_at} />
              </span>
            </div>
          </div>
          {order.note && (
            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground block mb-1 text-xs">{t("orders.form.note")}</span>
              <p className="text-foreground bg-muted/50 p-3 rounded-xl border border-border/60 whitespace-pre-wrap text-sm">
                {order.note}
              </p>
            </div>
          )}
          {order.shipment_id && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-muted-foreground">{t("shipments.title")}</span>
              <Link
                href={`/shipments/${order.shipment_id}`}
                className="text-primary hover:underline font-medium text-sm"
              >
                {t("shipments.detail.title")} &rarr;
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card C: Products */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("orders.detail.products")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {item.unit_price.toLocaleString()} {t("currency")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground">
                    {item.subtotal.toLocaleString()} {t("currency")}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-border space-y-1.5 text-sm">
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>{t("orders.detail.total")}</span>
              <span>{order.total_price.toLocaleString()} {t("currency")}</span>
            </div>
            {order.deposit_paid > 0 && (
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>{t("orders.detail.deposit")}</span>
                <span>{order.deposit_paid.toLocaleString()} {t("currency")}</span>
              </div>
            )}
            {order.balance_due > 0 && (
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-medium text-xs">
                <span>{t("orders.detail.balance")}</span>
                <span>{order.balance_due.toLocaleString()} {t("currency")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card D: Payment Editor */}
      <OrderPaymentEditor
        orderId={order.id}
        depositPaid={order.deposit_paid}
        totalPrice={order.total_price}
        paymentMethod={order.payment_method}
      />
    </div>
  );
}

