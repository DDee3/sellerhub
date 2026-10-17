import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DealForm } from "@/components/deals/deal-form";
import type { RateDisplayMode } from "@/types/database";

export const metadata = {
  title: "Record a Deal | exchange",
};

async function DealFormLoader() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rateDisplayMode: RateDisplayMode = "mmk_per_thb";

  if (user) {
    const { data: shop } = await supabase
      .from("shops")
      .select("rate_display_mode")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (shop?.rate_display_mode) {
      rateDisplayMode = shop.rate_display_mode;
    }
  }

  return <DealForm initialRateDisplayMode={rateDisplayMode} />;
}

export default function NewDealPage() {
  return (
    <div className="space-y-6 max-w-xl">
      {/* Back link & Title */}
      <div className="space-y-3">
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Deals</span>
        </Link>
        <h1 className="text-3xl font-light tracking-[-0.64px] text-foreground">
          Record a Deal
        </h1>
      </div>

      {/* Form Container wrapped in Suspense */}
      <Suspense
        fallback={
          <div className="h-96 rounded-xl border border-border bg-card p-6 shadow-stripi-1 animate-pulse" />
        }
      >
        <DealFormLoader />
      </Suspense>
    </div>
  );
}
