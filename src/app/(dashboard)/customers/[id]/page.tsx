import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil, Package } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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

function OrderStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          စောင့်ဆိုင်း
        </Badge>
      );
    case "confirmed":
      return (
        <Badge
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          အတည်ပြု
        </Badge>
      );
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="border-emerald-600 text-emerald-600 bg-emerald-50/50 text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          ပေးပြီး
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="destructive"
          className="text-[10px] px-1.5 py-0 h-5 font-normal"
        >
          ပယ်ဖျက်
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

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!shop) {
    notFound();
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (!customer) {
    notFound();
  }

  const { data: ordersData } = await supabase
    .from("orders")
    .select<string, CustomerOrderRow>("id, total_price, balance_due, status, created_at")
    .eq("customer_id", id)
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  const orders = ordersData ?? [];

  const totalSpent = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

  const outstanding = orders
    .filter((o) => o.status === "pending" || o.status === "confirmed")
    .reduce((sum, o) => sum + (Number(o.balance_due) || 0), 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-10 w-10 border-slate-200 bg-white shadow-xs shrink-0"
            )}
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
            <span className="sr-only">နောက်သို့</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {customer.name}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {customer.phone || "ဖုန်း မရှိပါ"}
            </p>
          </div>
        </div>

        <Link
          href={`/customers/${customer.id}/edit`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5 bg-white border-slate-200 shadow-xs"
          )}
        >
          <Pencil className="h-3.5 w-3.5" />
          ပြင်ဆင်မည်
        </Link>
      </div>

      {/* Card A: အချက်အလက် */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            အချက်အလက်
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {customer.phone && (
            <div>
              <span className="text-xs text-muted-foreground block">
                ဖုန်းနံပါတ်
              </span>
              <a
                href={`tel:${customer.phone}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {customer.phone}
              </a>
            </div>
          )}

          {customer.facebook_name && (
            <div>
              <span className="text-xs text-muted-foreground block">
                Facebook အမည်
              </span>
              <span className="font-medium text-slate-900">
                {customer.facebook_name}
              </span>
            </div>
          )}

          {customer.telegram_username && (
            <div>
              <span className="text-xs text-muted-foreground block">
                Telegram
              </span>
              <span className="font-medium text-slate-900">
                {customer.telegram_username}
              </span>
            </div>
          )}

          {customer.address && (
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground block">
                လိပ်စာ
              </span>
              <p className="font-medium text-slate-900 whitespace-pre-wrap mt-0.5">
                {customer.address}
              </p>
            </div>
          )}

          {customer.note && (
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground block">
                မှတ်ချက်
              </span>
              <p className="text-slate-800 whitespace-pre-wrap mt-0.5">
                {customer.note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card B: အော်ဒါများ */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            အော်ဒါများ ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {orders.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                အော်ဒါ မရှိသေးပါ
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
                  <div className="p-3 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition shadow-xs cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <span className="text-xs text-muted-foreground">
                          <MyanmarDate date={order.created_at} />
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {Number(order.total_price).toLocaleString()} ကျပ်
                      </span>
                    </div>
                    {order.balance_due > 0 && (
                      <div className="text-right mt-1.5">
                        <span className="text-xs text-amber-600 font-medium">
                          ကျန် {Number(order.balance_due).toLocaleString()} ကျပ်
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

      {/* Card C: ငွေစာရင်း (summary) */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            ငွေစာရင်း
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-xs text-muted-foreground block">
              စုစုပေါင်း ဝယ်ယူမှု (ပြီးစီး)
            </span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {totalSpent.toLocaleString()} ကျပ်
            </span>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100">
            <span className="text-xs text-amber-700 block">
              ပေးရန် ကျန်ငွေ
            </span>
            <span className="text-lg font-bold text-amber-600 mt-1 block">
              {outstanding.toLocaleString()} ကျပ်
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

