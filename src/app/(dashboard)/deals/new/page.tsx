import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DealForm } from "@/components/deals/deal-form";
import type { RateDisplayMode } from "@/types/database";

export const metadata = {
  title: "Record a Deal | exchange",
};

export default async function NewDealPage() {
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

  return (
    <div className="space-y-6 max-w-xl">
      {/* Back link & Title */}
      <div className="space-y-2">
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Deals</span>
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Record a Deal
        </h1>
      </div>

      {/* Form Container */}
      <DealForm initialRateDisplayMode={rateDisplayMode} />
    </div>
  );
}
