"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Package, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { DeleteCustomerButton } from "@/components/customers/delete-customer-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

interface CustomerOrderRow {
  id: string;
  total_price: number;
  balance_due: number;
  status: string;
  created_at: string;
}

interface CustomerData {
  id: string;
  name: string;
  phone: string | null;
  facebook_name: string | null;
  telegram_username: string | null;
  address: string | null;
  note: string | null;
}

function OrderStatusBadge({
  status,
  t,
}: {
  status: string;
  t: (key: string) => string;
}) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          {t("orders.status_pending")}
        </Badge>
      );
    case "confirmed":
      return (
        <Badge
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 py-0 h-5 font-normal"
        >
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
        <Badge
          variant="destructive"
          className="text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          {t("orders.status_cancelled")}
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          {status}
        </Badge>
      );
  }
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [orders, setOrders] = useState<CustomerOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchCustomerData() {
      const supabase = createClient();

      const { data: customerData, error: customerErr } = await supabase
        .from("customers")
        .select("id, name, phone, facebook_name, telegram_username, address, note")
        .eq("id", id)
        .maybeSingle();

      if (customerErr || !customerData) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      const { data: ordersData } = await supabase
        .from("orders")
        .select<string, CustomerOrderRow>("id, total_price, balance_due, status, created_at")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });

      if (isMounted) {
        setCustomer(customerData);
        setOrders(ordersData ?? []);
        setLoading(false);
      }
    }

    fetchCustomerData();

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

  if (!customer) {
    notFound();
  }

  const totalSpent = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  const outstanding = orders
    .filter((o) => o.status === "pending" || o.status === "confirmed")
    .reduce((sum, o) => sum + (Number(o.balance_due) || 0), 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-10 w-10 rounded-xl border-border bg-card text-foreground hover:bg-muted shadow-soft shrink-0"
            )}
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">{t("back")}</span>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {customer.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {customer.phone || t("customers.no_phone")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Pencil className="h-4 w-4" />
            {t("common.edit")}
          </Link>
          <DeleteCustomerButton
            customerId={id}
            customerName={customer.name}
            ordersCount={orders.length}
          />
        </div>
      </div>

      {/* Card A: Info */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("customers.detail.info")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {customer.phone && (
            <div>
              <span className="text-xs text-muted-foreground block">
                {t("customers.detail.phone")}
              </span>
              <a
                href={`tel:${customer.phone}`}
                className="font-medium text-primary hover:underline"
              >
                {customer.phone}
              </a>
            </div>
          )}

          {customer.facebook_name && (
            <div>
              <span className="text-xs text-muted-foreground block">
                {t("customers.detail.facebook")}
              </span>
              <span className="font-medium text-foreground">
                {customer.facebook_name}
              </span>
            </div>
          )}

          {customer.telegram_username && (
            <div>
              <span className="text-xs text-muted-foreground block">
                Telegram
              </span>
              <span className="font-medium text-foreground">
                {customer.telegram_username}
              </span>
            </div>
          )}

          {customer.address && (
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground block">
                {t("customers.detail.address")}
              </span>
              <p className="font-medium text-foreground whitespace-pre-wrap mt-0.5">
                {customer.address}
              </p>
            </div>
          )}

          {customer.note && (
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground block">
                {t("customers.form.note")}
              </span>
              <p className="text-foreground whitespace-pre-wrap mt-0.5 bg-muted/50 p-3 rounded-xl border border-border/60">
                {customer.note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card B: Orders */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("customers.detail.orders")} ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {orders.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-muted-foreground">
                {t("customers.detail.no_orders")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block group"
                >
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/50 hover:bg-muted transition shadow-soft cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} t={t} />
                        <span className="text-xs text-muted-foreground">
                          <MyanmarDate date={order.created_at} />
                        </span>
                      </div>
                      <span className="font-semibold text-foreground shrink-0">
                        {Number(order.total_price).toLocaleString()} {t("currency")}
                      </span>
                    </div>
                    {order.balance_due > 0 && (
                      <div className="text-right mt-1.5">
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          {t("orders.balance_due")} {Number(order.balance_due).toLocaleString()} {t("currency")}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card C: Summary */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("orders.payment.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border/60">
            <span className="text-xs text-muted-foreground block">
              {t("orders.detail.total")} ({t("orders.status_delivered")})
            </span>
            <span className="text-lg font-bold text-foreground mt-1 block">
              {totalSpent.toLocaleString()} {t("currency")}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium block">
              {t("orders.detail.balance")}
            </span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1 block">
              {outstanding.toLocaleString()} {t("currency")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
