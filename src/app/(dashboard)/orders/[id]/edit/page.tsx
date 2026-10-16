"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  OrderForm,
  type OrderFormProduct,
} from "@/components/orders/order-form";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

interface RawOrderItem {
  product_id: string | null;
  quantity: number;
  product_name: string;
}

interface RawOrder {
  id: string;
  status: string;
  order_type: "stock" | "preorder";
  total_price: number;
  deposit_paid: number;
  payment_method: "kbz_pay" | "wave_pay" | "cash" | "cod";
  note: string | null;
  customers: { name: string } | { name: string }[] | null;
  order_items: RawOrderItem[] | null;
}

export default function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [order, setOrder] = useState<RawOrder | null>(null);
  const [products, setProducts] = useState<OrderFormProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select<string, RawOrder>(
          "id, status, order_type, total_price, deposit_paid, payment_method, note, customers(name), order_items(product_id, quantity, product_name)"
        )
        .eq("id", id)
        .maybeSingle();

      if (orderErr || !orderData) {
        if (isMounted) notFound();
        return;
      }

      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, price, type, stock_qty, deposit_percent")
        .eq("is_active", true)
        .order("name");

      if (isMounted) {
        setOrder(orderData);
        setProducts(
          (productsData ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            type: p.type as "stock" | "preorder" | "hybrid",
            stock_qty: Number(p.stock_qty),
            deposit_percent: Number(p.deposit_percent),
          }))
        );
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  if (order.status === "delivered" || order.status === "cancelled") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <div className="flex items-center gap-3">
          <Link
            href={`/orders/${id}`}
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
              {t("orders.form.edit_title")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              #{order.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl p-8 text-center space-y-3">
          <p className="text-base font-semibold text-foreground">
            {order.status === "delivered"
              ? t("orders.status_delivered")
              : t("orders.status_cancelled")}
          </p>
          <div className="pt-2">
            <Link
              href={`/orders/${id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-xl border-border bg-card text-foreground hover:bg-muted"
              )}
            >
              &larr; {t("orders.detail.title")}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const customerName = Array.isArray(order.customers)
    ? order.customers[0]?.name ?? ""
    : order.customers?.name ?? "";

  const items = (order.order_items ?? [])
    .filter((oi) => oi.product_id !== null)
    .map((oi) => ({
      product_id: oi.product_id as string,
      quantity: oi.quantity,
    }));

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/orders/${id}`}
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
            {t("orders.form.edit_title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            #{order.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <OrderForm
        orderId={id}
        products={products}
        initialValues={{
          items,
          deposit_paid: order.deposit_paid,
          payment_method: order.payment_method,
          note: order.note ?? "",
          customer_name: customerName,
          order_type: order.order_type,
        }}
      />
    </div>
  );
}
