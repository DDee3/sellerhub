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
      return (
        <Badge
          variant="secondary"
          className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          မှာယူနေ
        </Badge>
      );
    case "in_transit":
      return (
        <Badge
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          လမ်းပေါ်
        </Badge>
      );
    case "arrived":
      return (
        <Badge
          variant="outline"
          className="border-emerald-600 text-emerald-600 bg-emerald-50/50 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          ရောက်ပြီ
        </Badge>
      );
    case "delivering":
      return (
        <Badge
          variant="default"
          className="bg-amber-600 hover:bg-amber-700 text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          ပို့နေ
        </Badge>
      );
    case "completed":
      return (
        <Badge
          variant="outline"
          className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          ပြီးစီး
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ပို့ဆောင်မှုများ
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {shipments.length} ခု ရှိသည်
          </p>
        </div>
        <Link
          href="/shipments/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full sm:w-auto inline-flex items-center justify-center h-10 gap-1.5 px-4 font-medium shadow-xs"
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
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-white border-slate-200/80 shadow-xs">
          <Truck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-medium text-slate-700">
            ပို့ဆောင်မှု မရှိသေးပါ
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {params.q || (params.status && params.status !== "all")
              ? "ရှာဖွေမှု ကိုက်ညီသော ပို့ဆောင်မှု မတွေ့ပါ"
              : "ပို့ဆောင်မှုအသစ် ဖန်တီးပါ"}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {shipments.map((shipment) => (
            <Link
              key={shipment.id}
              href={`/shipments/${shipment.id}`}
              className="block group"
            >
              <div className="p-3 flex items-center gap-3 rounded-xl border bg-white border-slate-200/80 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
                {/* LEFT: 44px rounded-lg with Truck icon */}
                <div className="h-11 w-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 select-none">
                  <Truck className="h-5 w-5 text-slate-400" />
                </div>

                {/* MIDDLE */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center min-w-0">
                    <span className="font-medium text-base text-slate-900 truncate">
                      {shipment.name}
                    </span>
                    <ShipmentStatusBadge status={shipment.status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {shipment.source ? `${shipment.source} · ` : ""}
                    အော်ဒါ {shipment.orders_count} ခု
                  </p>
                  <div className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1.5">
                    <span>မှာ:</span>
                    {shipment.order_date ? (
                      <MyanmarDate date={shipment.order_date} />
                    ) : (
                      <span>—</span>
                    )}
                    <span>→</span>
                    <span>ရောက်:</span>
                    {shipment.arrive_date ? (
                      <MyanmarDate date={shipment.arrive_date} />
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-slate-900 tabular-nums">
                    {Number(shipment.total_cost || 0).toLocaleString()} ကျပ်
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ကုန်ကျ
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export { ShipmentFilters };
