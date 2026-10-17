import { Suspense } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import {
  getTodaySummary,
  getCashFloat,
  getRecentDeals,
  getShopRateDisplayMode,
} from "@/lib/queries/deals";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard | exchange",
};

async function DashboardSummaryCards() {
  const [{ count, totalProfit }, { netMmk, netThb }] = await Promise.all([
    getTodaySummary(),
    getCashFloat(),
  ]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card 1: Today's Deals */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-stripi-1 space-y-1">
        <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-[0.1px]">
          Today&apos;s Deals
        </p>
        <div className="text-2xl font-light tracking-tight text-foreground tabular-nums">
          {count}
        </div>
      </div>

      {/* Card 2: Today's Profit */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-stripi-1 space-y-1">
        <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-[0.1px]">
          Today&apos;s Profit
        </p>
        <div className="text-2xl font-light tracking-tight text-foreground tabular-nums flex items-baseline gap-1.5">
          <span>{totalProfit.toLocaleString()}</span>
          <span className="text-xs font-light text-muted-foreground">MMK</span>
        </div>
      </div>

      {/* Card 3: Own Float MMK */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-stripi-1 space-y-1">
        <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-[0.1px]">
          Own Float MMK
        </p>
        <div className="text-2xl font-light tracking-tight text-foreground tabular-nums flex items-baseline gap-1.5">
          <span>{netMmk.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          <span className="text-xs font-light text-muted-foreground">MMK</span>
        </div>
      </div>

      {/* Card 4: Own Float THB */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-stripi-1 space-y-1">
        <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-[0.1px]">
          Own Float THB
        </p>
        <div className="text-2xl font-light tracking-tight text-foreground tabular-nums flex items-baseline gap-1.5">
          <span>{netThb.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          <span className="text-xs font-light text-muted-foreground">THB</span>
        </div>
      </div>
    </div>
  );
}

async function RecentDealsSection() {
  const [deals, rateDisplayMode] = await Promise.all([
    getRecentDeals(5),
    getShopRateDisplayMode(),
  ]);

  const isLakhMode = rateDisplayMode === "thb_per_lakh";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium tracking-tight text-foreground">
            Recent Deals
          </h2>
          <p className="text-xs text-muted-foreground font-light">
            Last 5 transactions
          </p>
        </div>
        <Link
          href="/deals"
          className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-normal"
        >
          <span>View all</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center flex flex-col items-center justify-center space-y-2 shadow-stripi-1">
          <p className="text-xs text-muted-foreground font-light">
            No deals recorded yet.
          </p>
          <Link
            href="/deals/new"
            className="text-xs text-primary hover:underline font-normal inline-flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Record your first deal
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-stripi-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground font-normal">
                  <th className="py-2.5 px-3.5 font-normal text-[11px] tracking-[0.05px]">
                    Date
                  </th>
                  <th className="py-2.5 px-3.5 font-normal text-[11px] tracking-[0.05px]">
                    Direction
                  </th>
                  <th className="py-2.5 px-3.5 text-right font-normal text-[11px] tracking-[0.05px]">
                    Amount In
                  </th>
                  <th className="py-2.5 px-3.5 text-right font-normal text-[11px] tracking-[0.05px]">
                    Rate
                  </th>
                  <th className="py-2.5 px-3.5 text-right font-normal text-[11px] tracking-[0.05px]">
                    Amount Out
                  </th>
                  <th className="py-2.5 px-3.5 text-right font-normal text-[11px] tracking-[0.05px]">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deals.map((deal) => {
                  const inCurrency =
                    deal.direction === "mmk_to_thb" ? "MMK" : "THB";
                  const outCurrency =
                    deal.direction === "mmk_to_thb" ? "THB" : "MMK";

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
                    <tr
                      key={deal.id}
                      className="hover:bg-canvas-soft/70 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-muted-foreground font-light text-[12px]">
                        <span>{formattedDate}</span>{" "}
                        <span className="text-[11px] text-muted-foreground/70">
                          {formattedTime}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-normal tracking-[0.1px]",
                            deal.direction === "mmk_to_thb"
                              ? "bg-[#b9b9f9]/40 text-[#4434d4] dark:bg-[#533afd]/25 dark:text-[#b9b9f9]"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          )}
                        >
                          {deal.direction === "mmk_to_thb"
                            ? "MMK → THB"
                            : "THB → MMK"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-right font-light text-foreground tabular-nums tracking-[-0.42px]">
                        {deal.amount_in.toLocaleString()} {inCurrency}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-right tabular-nums tracking-[-0.42px] text-muted-foreground font-light">
                        {formattedRate}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-right font-light text-foreground tabular-nums tracking-[-0.42px]">
                        {deal.amount_out.toLocaleString()} {outCurrency}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-right font-light tabular-nums tracking-[-0.42px]">
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-[-0.64px] text-foreground">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm font-light text-muted-foreground mt-0.5">
          Overview of today&apos;s exchange activity
        </p>
      </div>

      {/* Summary Cards Grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
            <div className="h-20 rounded-xl border border-border bg-card shadow-stripi-1" />
            <div className="h-20 rounded-xl border border-border bg-card shadow-stripi-1" />
            <div className="h-20 rounded-xl border border-border bg-card shadow-stripi-1" />
            <div className="h-20 rounded-xl border border-border bg-card shadow-stripi-1" />
          </div>
        }
      >
        <DashboardSummaryCards />
      </Suspense>

      {/* Recent Deals Utility */}
      <Suspense
        fallback={
          <div className="h-44 rounded-xl border border-border bg-card shadow-stripi-1 animate-pulse" />
        }
      >
        <RecentDealsSection />
      </Suspense>
    </div>
  );
}
