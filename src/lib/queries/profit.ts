import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ProfitSummary {
  thisMonthRevenue: number;
  thisMonthProfit: number;
  lastMonthProfit: number;
  percentChange: number;
  marginPercent: number;
  dailySeries: { day: string; profit: number }[];
}

interface OrderJoin {
  shop_id: string;
  status: string;
  created_at: string;
}

interface ProductJoin {
  cost_price: number | null;
}

interface OrderItemJoinRow {
  quantity: number | null;
  subtotal: number | null;
  orders: OrderJoin | null;
  products: ProductJoin | null;
}

export async function getProfitSummary(shopId: string): Promise<ProfitSummary> {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const fetchWindow = async (from: string, to?: string): Promise<OrderItemJoinRow[]> => {
    let q = supabase
      .from("order_items")
      .select<string, OrderItemJoinRow>(
        "quantity, subtotal, orders!inner(shop_id, status, created_at), products!inner(cost_price)"
      )
      .eq("orders.shop_id", shopId)
      .eq("orders.status", "delivered")
      .gte("orders.created_at", from);
    if (to) q = q.lt("orders.created_at", to);
    const { data, error } = await q;
    if (error) {
      console.error("[profit] error:", error);
      return [];
    }
    return data ?? [];
  };

  const thisMonth = await fetchWindow(monthStart);
  console.log("[profit] thisMonth rows:", thisMonth.length);
  console.log("[profit] first row:", thisMonth[0]);
  const lastMonth = await fetchWindow(lastMonthStart, monthStart);

  const calc = (rows: OrderItemJoinRow[]) => {
    let revenue = 0;
    let cost = 0;
    for (const r of rows) {
      const cp = r.products?.cost_price;
      if (cp === null || cp === undefined) continue;
      const qty = Number(r.quantity) || 0;
      const subtotal = Number(r.subtotal) || 0;
      revenue += subtotal;
      cost += qty * Number(cp);
    }
    return { revenue, profit: revenue - cost };
  };

  const thisTotals = calc(thisMonth);
  const lastTotals = calc(lastMonth);

  const percentChange =
    lastTotals.profit === 0
      ? thisTotals.profit > 0
        ? 100
        : 0
      : ((thisTotals.profit - lastTotals.profit) / Math.abs(lastTotals.profit)) * 100;

  const marginPercent =
    thisTotals.revenue === 0 ? 0 : (thisTotals.profit / thisTotals.revenue) * 100;

  const dailyMap = new Map<string, number>();
  for (const r of thisMonth) {
    const cp = r.products?.cost_price;
    if (cp === null || cp === undefined) continue;
    const day = r.orders?.created_at?.slice(0, 10);
    if (!day) continue;
    const qty = Number(r.quantity) || 0;
    const subtotal = Number(r.subtotal) || 0;
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + (subtotal - qty * Number(cp)));
  }
  const dailySeries = Array.from(dailyMap.entries())
    .map(([day, profit]) => ({ day, profit }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return {
    thisMonthRevenue: thisTotals.revenue,
    thisMonthProfit: thisTotals.profit,
    lastMonthProfit: lastTotals.profit,
    percentChange,
    marginPercent,
    dailySeries,
  };
}
