import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";

import { getOrders, type OrderStatus } from "@/lib/queries/orders";
import { OrderFilters } from "@/components/orders/order-filters";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">စောင့်ဆိုင်း</Badge>;
    case "confirmed":
      return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">အတည်ပြု</Badge>;
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="border-emerald-600 text-emerald-600 bg-emerald-50/50"
        >
          ပေးပြီး
        </Badge>
      );
    case "cancelled":
      return <Badge variant="destructive">ပယ်ဖျက်</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function OrderTypeBadge({ type }: { type: "stock" | "preorder" }) {
  if (type === "stock") {
    return <Badge variant="default">လက်ကျန်</Badge>;
  }
  return <Badge variant="secondary">ကြိုမှာ</Badge>;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orders = await getOrders({
    search: params.q,
    status: params.status,
  });

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            အော်ဒါများ
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {orders.length} ခု ရှိသည်
          </p>
        </div>
        <Link
          href="/orders/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 gap-1.5 px-4 font-medium shadow-xs"
          )}
        >
          <Plus className="h-4 w-4" />
          အော်ဒါအသစ်
        </Link>
      </div>

      {/* Filters */}
      <OrderFilters />

      {/* Empty state */}
      {orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center bg-white border-slate-200/80 shadow-xs">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            အော်ဒါ မရှိသေးပါ
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            {params.q || (params.status && params.status !== "all")
              ? "ရှာဖွေမှု ကိုက်ညီသော အော်ဒါ မတွေ့ပါ"
              : "အော်ဒါအသစ် ဖန်တီးပါ"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block group"
            >
              <Card className="p-4 bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer space-y-2.5">
                {/* Row 1: customer_name + status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900 truncate">
                    {order.customer_name}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Row 2: order_type Badge + items_count */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <OrderTypeBadge type={order.order_type} />
                  <span>•</span>
                  <span>ပစ္စည်း {order.items_count} မျိုး</span>
                </div>

                {/* Row 3: total_price + deposit/balance */}
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 text-base">
                    {order.total_price.toLocaleString()} ကျပ်
                  </span>
                  {order.deposit_paid > 0 && order.balance_due > 0 && (
                    <span className="text-sm text-muted-foreground">
                      စရံ {order.deposit_paid.toLocaleString()} ကျပ် / ကျန် {order.balance_due.toLocaleString()} ကျပ်
                    </span>
                  )}
                </div>

                {/* Row 4: created_at formatted */}
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>မှာယူသည့်ရက် -</span>
                  <MyanmarDate date={order.created_at} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export { OrderFilters };
