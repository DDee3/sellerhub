import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DealForm } from "@/components/deals/deal-form";
import type { RateDisplayMode } from "@/types/database";

export const metadata = {
  title: "Edit Deal | exchange",
};

interface EditDealPageProps {
  params: Promise<{ id: string }>;
}

async function EditDealLoader({ id }: { id: string }) {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch shop to get rate display mode and verify ownership
  const { data: shop } = await supabase
    .from("shops")
    .select("id, rate_display_mode")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!shop) {
    notFound();
  }

  // Fetch the deal by ID
  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (!deal) {
    notFound();
  }

  // Also fetch customers list for this shop
  const { data: _customers } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("shop_id", shop.id)
    .order("name", { ascending: true });

  const rateDisplayMode = (shop.rate_display_mode as RateDisplayMode) || "mmk_per_thb";

  return (
    <DealForm
      dealId={id}
      initialData={deal}
      initialRateDisplayMode={rateDisplayMode}
    />
  );
}

export default async function EditDealPage({ params }: EditDealPageProps) {
  const { id } = await params;

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
          Edit Deal
        </h1>
      </div>

      {/* Form Container wrapped in Suspense */}
      <Suspense
        fallback={
          <div className="h-96 rounded-xl border border-border bg-card p-6 shadow-stripi-1 animate-pulse" />
        }
      >
        <EditDealLoader id={id} />
      </Suspense>
    </div>
  );
}

