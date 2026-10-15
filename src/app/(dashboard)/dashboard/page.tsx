import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getDashboardStats,
  getUpcomingShipments,
  getLowStockProducts,
} from "@/lib/queries/dashboard";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    redirect("/signup");
  }

  // Fetch all 3 queries in parallel
  const [stats, upcomingShipments, lowStockProducts] = await Promise.all([
    getDashboardStats(shop.id),
    getUpcomingShipments(shop.id, 7),
    getLowStockProducts(shop.id),
  ]);

  return (
    <DashboardView
      shop={shop}
      stats={stats}
      upcomingShipments={upcomingShipments}
      lowStockProducts={lowStockProducts}
    />
  );
}
