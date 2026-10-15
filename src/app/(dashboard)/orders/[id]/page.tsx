import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { getOrderById, type OrderStatus } from "@/lib/queries/orders";
import { OrderStatusActions } from "@/components/orders/order-status-actions";
import { OrderPaymentEditor } from "@/components/orders/order-payment-editor";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">စောင့်ဆိုင်း</Badge>;
    case "confirmed":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          အတည်ပြု
        </Badge>
      );
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

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header with back button & status Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
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
              အော်ဒါ အသေးစိတ်
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              အော်ဒါ #{order.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Card A: ဖောက်သည် */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            ဖောက်သည်
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">အမည်</span>
            <span className="font-medium text-slate-900">
              {order.customer_name}
            </span>
          </div>
          {order.customer_phone && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">ဖုန်းနံပါတ်</span>
              <a
                href={`tel:${order.customer_phone}`}
                className="text-slate-900 font-medium hover:underline"
              >
                {order.customer_phone}
              </a>
            </div>
          )}
          {order.customer_facebook && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Facebook အကောင့်</span>
              <span className="text-slate-900">{order.customer_facebook}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card B: အော်ဒါ အချက်အလက် */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            အော်ဒါ အချက်အလက်
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">အော်ဒါ အမျိုးအစား</span>
            <OrderTypeBadge type={order.order_type} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">မှာယူသည့်ရက်</span>
            <span className="text-slate-700">
              <MyanmarDate date={order.created_at} />
            </span>
          </div>
          {order.note && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 block mb-1">မှတ်ချက်</span>
              <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg whitespace-pre-wrap">
                {order.note}
              </p>
            </div>
          )}
          {order.shipment_id && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500">ပို့ဆောင်မှု</span>
              <Link
                href={`/shipments/${order.shipment_id}`}
                className="text-blue-600 hover:underline font-medium text-sm"
              >
                ပို့ဆောင်မှု ကြည့်ရန် &rarr;
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card C: ပစ္စည်းများ */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            ပစ္စည်းများ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} × {item.unit_price.toLocaleString()} ကျပ်
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    {item.subtotal.toLocaleString()} ကျပ်
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-semibold text-slate-900 text-sm">
            <span>စုစုပေါင်း</span>
            <span>{order.total_price.toLocaleString()} ကျပ်</span>
          </div>
        </CardContent>
      </Card>

      {/* Card D: ငွေပေးချေမှု (Editable) */}
      <OrderPaymentEditor
        orderId={order.id}
        depositPaid={order.deposit_paid}
        totalPrice={order.total_price}
        paymentMethod={order.payment_method}
      />

      {/* Bottom action row */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <OrderStatusActions
          orderId={id}
          currentStatus={order.status}
          orderType={order.order_type}
        />
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <Link
            href={`/orders/${id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "gap-1.5 font-medium"
            )}
          >
            <Pencil className="h-4 w-4" />
            ပြင်ဆင်
          </Link>
        )}
      </div>
    </div>
  );
}
