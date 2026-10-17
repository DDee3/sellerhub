import "server-only";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RateDisplayMode } from "@/types/database";

export interface TodaySummary {
  count: number;
  totalProfit: number;
}

export interface DealListItem {
  id: string;
  shop_id: string;
  direction: "mmk_to_thb" | "thb_to_mmk";
  amount_in: number;
  customer_rate: number;
  source_rate: number | null;
  amount_out: number;
  profit_mmk: number | null;
  note: string | null;
  created_at: string;
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

export async function getDeals(shopId?: string): Promise<DealListItem[]> {
  await connection();
  const supabase = await createClient();

  let targetShopId = shopId;

  if (!targetShopId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!shop) {
      return [];
    }

    targetShopId = shop.id;
  }

  const { data, error } = await supabase
    .from("deals")
    .select(
      "id, shop_id, direction, amount_in, customer_rate, source_rate, amount_out, profit_mmk, note, created_at"
    )
    .eq("shop_id", targetShopId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching deals:", error);
    return [];
  }

  return data as DealListItem[];
}

export async function getRecentDeals(
  limit: number = 5,
  shopId?: string
): Promise<DealListItem[]> {
  await connection();
  const supabase = await createClient();

  let targetShopId = shopId;

  if (!targetShopId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!shop) {
      return [];
    }

    targetShopId = shop.id;
  }

  const { data, error } = await supabase
    .from("deals")
    .select(
      "id, shop_id, direction, amount_in, customer_rate, source_rate, amount_out, profit_mmk, note, created_at"
    )
    .eq("shop_id", targetShopId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching recent deals:", error);
    return [];
  }

  return data as DealListItem[];
}

export async function getShopRateDisplayMode(
  shopId?: string
): Promise<RateDisplayMode> {
  await connection();
  const supabase = await createClient();

  if (shopId) {
    const { data: shop } = await supabase
      .from("shops")
      .select("rate_display_mode")
      .eq("id", shopId)
      .maybeSingle();

    return (shop?.rate_display_mode as RateDisplayMode) || "mmk_per_thb";
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "mmk_per_thb";
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("rate_display_mode")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (shop?.rate_display_mode as RateDisplayMode) || "mmk_per_thb";
}
