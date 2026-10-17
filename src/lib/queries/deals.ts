import "server-only";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface TodaySummary {
  count: number;
  totalProfit: number;
}

export async function getTodaySummary(): Promise<TodaySummary> {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { count: 0, totalProfit: 0 };
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!shop) {
    return { count: 0, totalProfit: 0 };
  }

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  ).toISOString();

  const { data, error } = await supabase
    .from("deals")
    .select("profit_mmk")
    .eq("shop_id", shop.id)
    .gte("created_at", todayStart);

  if (error || !data) {
    console.error("Error fetching today's deals summary:", error);
    return { count: 0, totalProfit: 0 };
  }

  const count = data.length;
  const totalProfit = data.reduce(
    (acc, deal) => acc + (Number(deal.profit_mmk) || 0),
    0
  );

  return {
    count,
    totalProfit: Math.round(totalProfit * 100) / 100,
  };
}

