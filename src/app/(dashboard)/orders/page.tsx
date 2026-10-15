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
      return (
        <Badge
          variant="secondary"
          className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          စောင့်ဆိုင်း
        </Badge>
      );
    case "confirmed":
      return (
        <Badge
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          အတည်ပြု
        </Badge>
      );
    case "delivered":
      return (
        <Badge
          variant="outline"
          className="border-emerald-600 text-emerald-600 bg-emerald-50/50 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          ပေးပြီး
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="destructive"
          className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          ပယ်ဖျက်
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

function OrderTypeBadge({ type }: { type: "stock" | "preorder" }) {
  if (type === "stock") {
    return (
      <Badge
        variant="default"
        className="text-[10px] px-1.5 py-0 h-4 font-normal"
      >
        လက်ကျန်
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="text-[10px] px-1.5 py-0 h-4 font-normal"
    >
      ကြိုမှာ
    </Badge>
  );
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            အော်ဒါများ
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {orders.length} ခု ရှိသည်
          </p>
        </div>
        <Link
          href="/orders/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full sm:w-auto inline-flex items-center justify-center h-10 gap-1.5 px-4 font-medium shadow-xs"
          )}
        >
          <Plus className="h-4 w-4" />
          အော်ဒါအသစ်
        </Link>
      </div>

      {/* Filters */}
      <OrderFilters />

      {/* Empty state or Orders list */}
      {orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-white border-slate-200/80 shadow-xs">
          <ShoppingCart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-medium text-slate-700">
            အော်ဒါ မရှိသေးပါ
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {params.q || (params.status && params.status !== "all")
              ? "ရှာဖွေမှု ကိုက်ညီသော အော်ဒါ မတွေ့ပါ"
              : "အော်ဒါအသစ် ဖန်တီးပါ"}
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
                <div className="p-3 flex items-center gap-3 rounded-xl border bg-white border-slate-200/80 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
                  {/* LEFT: 44px circle avatar */}
                  <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-base shrink-0 select-none">
                    {initial}
                  </div>

                  {/* MIDDLE */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center min-w-0">
                      <span className="font-medium text-base text-slate-900 truncate">
                        {order.customer_name}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground truncate">
                      <OrderTypeBadge type={order.order_type} />
                      <span>·</span>
                      <span>ပစ္စည်း {order.items_count} မျိုး</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <MyanmarDate date={order.created_at} />
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-slate-900 tabular-nums">
                      {order.total_price.toLocaleString()} ကျပ်
                    </p>
                    <div className="mt-0.5">
                      {order.balance_due > 0 ? (
                        <p className="text-xs text-amber-600 font-medium">
                          ကျန် {order.balance_due.toLocaleString()} ကျပ်
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground font-medium">
                          ရှင်းပြီး
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

export { OrderFilters };
