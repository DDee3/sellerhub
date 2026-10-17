import { Suspense } from "react";
import { getDeals, getShopRateDisplayMode } from "@/lib/queries/deals";
import { DealsView } from "@/components/deals/deals-view";

export const metadata = {
  title: "Deals | exchange",
};

async function DealsDataWrapper() {
  const [deals, rateDisplayMode] = await Promise.all([
    getDeals(),
    getShopRateDisplayMode(),
  ]);

  return <DealsView deals={deals} rateDisplayMode={rateDisplayMode} />;
}

export default function DealsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-border bg-card p-6 h-64 shadow-stripi-1 animate-pulse" />
      }
    >
      <DealsDataWrapper />
    </Suspense>
  );
}
