import Link from "next/link";
import { Plus } from "lucide-react";
import { getTodaySummary } from "@/lib/queries/deals";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard | exchange",
};

export default async function DashboardPage() {
  const { count, totalProfit } = await getTodaySummary();

  return (
    <div className="space-y-6">
      {/* Header with Title and Prominent CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Overview of today&apos;s exchange activity
          </p>
        </div>
        <div>
          <Link
            href="/deals/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "gap-1.5 h-9 px-4 text-xs font-semibold inline-flex items-center"
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Record a Deal</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Today's Deals */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Today&apos;s Deals
          </p>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {count}
          </div>
        </div>

        {/* Card 2: Today's Profit */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Today&apos;s Profit
          </p>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalProfit.toLocaleString()} MMK
          </div>
        </div>
      </div>
    </div>
  );
}
