import Link from "next/link";
import { Plus, Truck } from "lucide-react";

import { getShipments, type ShipmentStatus } from "@/lib/queries/shipments";
import { ShipmentFilters } from "@/components/shipments/shipment-filters";
import { MyanmarDate } from "@/components/dashboard/myanmar-date";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  switch (status) {
    case "ordering":
      return <Badge variant="secondary">မှာယူနေ</Badge>;
    case "in_transit":
      return <Badge variant="default">လမ်းပေါ်</Badge>;
    case "arrived":
      return <Badge variant="outline">ရောက်ပြီ</Badge>;
    case "delivering":
      return <Badge variant="default">ပို့နေ</Badge>;
    case "completed":
      return <Badge variant="outline">ပြီးစီး</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const shipments = await getShipments({
    search: params.q,
    status: params.status,
  });

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ပို့ဆောင်မှုများ
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {shipments.length} ခု ရှိသည်
          </p>
        </div>
        <Link
          href="/shipments/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 gap-1.5 px-4 font-medium shadow-xs"
          )}
        >
          <Plus className="h-4 w-4" />
          ပို့ဆောင်မှုအသစ်
        </Link>
      </div>

      {/* Filters */}
      <ShipmentFilters />

      {/* Empty state or Shipments List */}
      {shipments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center bg-white border-slate-200/80 shadow-xs">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Truck className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            ပို့ဆောင်မှု မရှိသေးပါ
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            {params.q || (params.status && params.status !== "all")
              ? "ရှာဖွေမှု ကိုက်ညီသော ပို့ဆောင်မှု မတွေ့ပါ"
              : "ပို့ဆောင်မှုအသစ် ဖန်တီးပါ"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <Link
              key={shipment.id}
              href={`/shipments/${shipment.id}`}
              className="block group"
            >
              <Card className="p-4 bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer space-y-2.5">
                {/* Row 1: name + status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900 truncate">
                    {shipment.name}
                  </span>
                  <ShipmentStatusBadge status={shipment.status} />
                </div>

                {/* Row 2: source Badge + orders_count + total_cost */}
                <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
                  {shipment.source && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {shipment.source}
                    </Badge>
                  )}
                  <span>အော်ဒါ {shipment.orders_count} ခု</span>
                  <span>•</span>
                  <span>
                    ကုန်ကျ {(shipment.total_cost ?? 0).toLocaleString()} ကျပ်
                  </span>
                </div>

                {/* Row 3: order_date + arrive_date */}
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">မှာ:</span>
                    {shipment.order_date ? (
                      <MyanmarDate date={shipment.order_date} />
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">ရောက်:</span>
                    {shipment.arrive_date ? (
                      <MyanmarDate date={shipment.arrive_date} />
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export { ShipmentFilters };
