import "server-only";
import { createClient } from "@/lib/supabase/server";
import { format, addDays } from "date-fns";

export interface DashboardStats {
  activeShipments: number;
  pendingOrders: number;
  unpaidBalance: number;
  lowStockCount: number;
}

export async function getDashboardStats(shopId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  // 1. Active Shipments (status != 'completed')
  const activeShipmentsPromise = supabase
    .from("shipments")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shopId)
    .neq("status", "completed");

  // 2. Pending Orders (status = 'pending')
  const pendingOrdersPromise = supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shopId)
    .eq("status", "pending");

  // 3. Unpaid Balance sum (balance_due for non-cancelled orders)
  const unpaidBalancePromise = supabase
    .from("orders")
    .select("balance_due")
    .eq("shop_id", shopId)
    .neq("status", "cancelled");

  // 4. Low stock products (type != 'preorder' AND stock_qty <= low_stock_alert)
  const lowStockPromise = supabase
    .from("products")
    .select("id, stock_qty, low_stock_alert")
    .eq("shop_id", shopId)
    .neq("type", "preorder")
    .eq("is_active", true);

  const [
    activeShipmentsRes,
    pendingOrdersRes,
    unpaidBalanceRes,
    lowStockRes,
  ] = await Promise.all([
    activeShipmentsPromise,
    pendingOrdersPromise,
    unpaidBalancePromise,
    lowStockPromise,
  ]);

  const activeShipments = activeShipmentsRes.count ?? 0;
  const pendingOrders = pendingOrdersRes.count ?? 0;

  const unpaidBalance = (unpaidBalanceRes.data ?? []).reduce(
    (sum, o) => sum + (o.balance_due || 0),
    0
  );

  const lowStockCount = (lowStockRes.data ?? []).filter(
    (p) => p.stock_qty <= p.low_stock_alert
  ).length;

  return {
    activeShipments,
    pendingOrders,
    unpaidBalance,
    lowStockCount,
  };
}

export async function getUpcomingShipments(shopId: string, days = 7) {
  const supabase = await createClient();
  const maxDate = format(addDays(new Date(), days), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("shipments")
    .select("id, name, arrive_date, status, source")
    .eq("shop_id", shopId)
    .neq("status", "completed")
    .not("arrive_date", "is", null)
    .lte("arrive_date", maxDate)
    .order("arrive_date", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching upcoming shipments:", error);
    return [];
  }

  return data ?? [];
}

export async function getLowStockProducts(shopId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, stock_qty, low_stock_alert, image_url, price")
    .eq("shop_id", shopId)
    .neq("type", "preorder")
    .eq("is_active", true)
    .order("stock_qty", { ascending: true });

  if (error) {
    console.error("Error fetching low stock products:", error);
    return [];
  }

  return (data ?? []).filter((p) => p.stock_qty <= p.low_stock_alert);
}

