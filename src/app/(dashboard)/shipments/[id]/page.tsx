import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Pencil } from "lucide-react";

import {
  getShipmentById,
  getUnassignedPreorderOrders,
  type ShipmentStatus,
} from "@/lib/queries/shipments";
import type { OrderStatus } from "@/lib/queries/orders";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { AssignOrdersButton } from "@/components/shipments/assign-orders-button";
import { ShipmentStatusActions } from "@/components/shipments/shipment-status-actions";
import { RemoveOrderButton } from "@/components/shipments/remove-order-button";
import { DeleteShipmentButton } from "@/components/shipments/delete-shipment-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  switch (status) {
    case "ordering":
      return <Badge variant="secondary">မှာယူနေ</Badge>;
    case "in_transit":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          လမ်းပေါ်
        </Badge>
      );
    case "arrived":
      return (
        <Badge
          variant="outline"
          className="border-emerald-600 text-emerald-600 bg-emerald-50/50"
        >
          ရောက်ပြီ
        </Badge>
      );
    case "delivering":
      return (
        <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">
          ပို့နေ
        </Badge>
      );
    case "completed":
      return <Badge variant="outline">ပြီးစီး</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
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

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shipment = await getShipmentById(id);

  if (!shipment) {
    notFound();
  }

  const unassignedOrders = await getUnassignedPreorderOrders();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/shipments"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-10 w-10 border-slate-200 bg-white shadow-xs shrink-0"
            )}
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
            <span className="sr-only">နောက်သို့</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {shipment.name}
              </h1>
              <ShipmentStatusBadge status={shipment.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {shipment.orders.length} orders •{" "}
              {Number(shipment.total_cost || 0).toLocaleString()} ကျပ်
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/shipments/${shipment.id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 bg-white border-slate-200"
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            ပြင်ဆင်မည်
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
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            အချက်အလက်
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground block">မူရင်း</span>
            <span className="font-medium text-slate-900">
              {shipment.source || "—"}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">
              ကုန်ကျစရိတ်
            </span>
            <span className="font-medium text-slate-900">
              {Number(shipment.total_cost || 0).toLocaleString()} ကျပ်
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">
              မှာယူသည့်ရက်
            </span>
            <span className="font-medium text-slate-900">
              {shipment.order_date ? (
                <MyanmarDate date={shipment.order_date} />
              ) : (
                "—"
              )}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">
              ရောက်မည့်ရက်
            </span>
            <span className="font-medium text-slate-900">
              {shipment.arrive_date ? (
                <MyanmarDate date={shipment.arrive_date} />
              ) : (
                "—"
              )}
            </span>
          </div>
          {shipment.note && (
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground block">
                မှတ်ချက်
              </span>
              <p className="text-slate-800 whitespace-pre-wrap mt-0.5">
                {shipment.note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card B: Orders */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            အော်ဒါများ ({shipment.orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {shipment.orders.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                အော်ဒါ မရှိသေးပါ
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                အောက်မှ အော်ဒါ ထည့်ပါ
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {shipment.orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 transition shadow-xs flex items-center justify-between gap-3 group"
                >
                  <Link
                    href={`/orders/${order.id}`}
                    className="min-w-0 flex-1 block"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition">
                        {order.customer_name}
                      </span>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {Number(order.total_price).toLocaleString()} ကျပ်
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          ပစ္စည်း {order.items_count} မျိုး
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      {order.balance_due > 0 && (
                        <span className="text-xs text-amber-600 font-medium">
                          ကျန် {Number(order.balance_due).toLocaleString()} ကျပ်
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="shrink-0 pl-1 border-l border-slate-100">
                    <RemoveOrderButton orderId={order.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card C: Assign Preorder Orders */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            အော်ဒါ ထည့်ရန်
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

