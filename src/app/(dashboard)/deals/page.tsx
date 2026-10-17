import { Suspense } from "react";
import Link from "next/link";
import { Plus, ArrowLeftRight } from "lucide-react";
import { getDeals, getShopRateDisplayMode } from "@/lib/queries/deals";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Deals | exchange",
};

async function DealsList() {
  const deals = await getDeals();
  const rateDisplayMode = await getShopRateDisplayMode();

  if (deals.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-stripi-1">
        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-light tracking-[-0.22px] text-foreground">
            No deals recorded yet
          </h3>
          <p className="text-sm font-light text-muted-foreground max-w-sm">
            Record your first currency exchange deal to start tracking rates and daily profits.
          </p>
        </div>
        <Link
          href="/deals/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-9 px-4 text-sm font-normal gap-1.5"
          )}
        >
          <Plus className="h-4 w-4" />
          <span>Record a deal</span>
        </Link>
      </div>
    );
  }

  const isLakhMode = rateDisplayMode === "thb_per_lakh";

  return (
    <div className="rounded-xl border border-border bg-card shadow-stripi-1 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border bg-canvas-soft text-muted-foreground font-normal">
              <th className="py-3 px-4 font-normal text-[12px] tracking-[0.05px]">Date</th>
              <th className="py-3 px-4 font-normal text-[12px] tracking-[0.05px]">Direction</th>
              <th className="py-3 px-4 text-right font-normal text-[12px] tracking-[0.05px]">Amount In</th>
              <th className="py-3 px-4 text-right font-normal text-[12px] tracking-[0.05px]">Customer Rate</th>
              <th className="py-3 px-4 text-right font-normal text-[12px] tracking-[0.05px]">Amount Out</th>
              <th className="py-3 px-4 text-right font-normal text-[12px] tracking-[0.05px]">Profit</th>
              <th className="py-3 px-4 font-normal text-[12px] tracking-[0.05px]">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals.map((deal) => {
              const inCurrency = deal.direction === "mmk_to_thb" ? "MMK" : "THB";
              const outCurrency = deal.direction === "mmk_to_thb" ? "THB" : "MMK";

              const formattedRate = isLakhMode
                ? (100000 / deal.customer_rate).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  }) + " THB/Lakh"
                : deal.customer_rate.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  }) + " MMK/THB";

              const dateObj = new Date(deal.created_at);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              const formattedTime = dateObj.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={deal.id} className="hover:bg-canvas-soft/70 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground font-light text-[13px]">
                    <div>{formattedDate}</div>
                    <div className="text-[11px] text-muted-foreground/70">
                      {formattedTime}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-normal tracking-[0.1px]",
                        deal.direction === "mmk_to_thb"
                          ? "bg-[#b9b9f9]/40 text-[#4434d4] dark:bg-[#533afd]/25 dark:text-[#b9b9f9]"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      )}
                    >
                      {deal.direction === "mmk_to_thb" ? "MMK → THB" : "THB → MMK"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-light text-foreground tabular-nums tracking-[-0.42px]">
                    {deal.amount_in.toLocaleString()} {inCurrency}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right tabular-nums tracking-[-0.42px] text-muted-foreground font-light">
                    {formattedRate}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-light text-foreground tabular-nums tracking-[-0.42px]">
                    {deal.amount_out.toLocaleString()} {outCurrency}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-light tabular-nums tracking-[-0.42px]">
                    {deal.profit_mmk !== null ? (
                      <span
                        className={
                          deal.profit_mmk >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-[#ea2261]"
                        }
                      >
                        {deal.profit_mmk.toLocaleString()} MMK
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-light max-w-xs truncate">
                    {deal.note || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DealsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-[-0.64px] text-foreground">
            Deals
          </h1>
          <p className="text-[15px] font-light text-muted-foreground mt-1">
            All recorded currency exchange deals
          </p>
        </div>
        <div>
          <Link
            href="/deals/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "gap-1.5 h-9 px-4 text-sm font-normal inline-flex items-center"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Record a Deal</span>
          </Link>
        </div>
      </div>

      {/* Deals List */}
      <Suspense
        fallback={
          <div className="rounded-xl border border-border bg-card p-6 h-64 shadow-stripi-1 animate-pulse" />
        }
      >
        <DealsList />
      </Suspense>
    </div>
  );
}
