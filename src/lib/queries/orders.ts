import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface OrderRow {
  id: string;
  customer_name: string;
  order_type: "stock" | "preorder";
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  status: OrderStatus;
  created_at: string;
  items_count: number;
}

interface RawOrderQueryRow {
  id: string;
  order_type: "stock" | "preorder";
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  status: string;
  created_at: string;
  customers: { name: string } | null;
  order_items: { id: string }[] | null;
}

export async function getOrders(opts: {
  search?: string;
  status?: string;
}): Promise<OrderRow[]> {
  const supabase = await createClient();

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
    .single();

  if (!shop) {
    return [];
  }

  const customerSelect = opts.search
    ? "customers!inner(name)"
    : "customers(name)";

  const selectColumns = `id, order_type, total_price, deposit_paid, balance_due, status, created_at, ${customerSelect}, order_items(id)`;

  let query = supabase
    .from("orders")
    .select<string, RawOrderQueryRow>(selectColumns)
    .eq("shop_id", shop.id);

  if (opts.search) {
    query = query.ilike("customers.name", `%${opts.search}%`);
  }

  if (opts.status && opts.status !== "all") {
    query = query.eq(
      "status",
      opts.status as Database["public"]["Tables"]["orders"]["Row"]["status"]
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data.map((order): OrderRow => {
    // Map simplified status or fallback
    let mappedStatus: OrderStatus = "pending";
    if (
      order.status === "confirmed" ||
      order.status === "delivered" ||
      order.status === "cancelled"
    ) {
      mappedStatus = order.status;
    } else if (order.status === "paid" || order.status === "packed" || order.status === "shipped") {
      mappedStatus = "confirmed";
    }

    return {
      id: order.id,
      customer_name: order.customers?.name || "အမည်မသိ ဖောက်သည်",
      order_type: order.order_type,
      total_price: order.total_price,
      deposit_paid: order.deposit_paid,
      balance_due: order.balance_due,
      status: mappedStatus,
      created_at: order.created_at,
      items_count: order.order_items?.length || 0,
    };
  });
}
