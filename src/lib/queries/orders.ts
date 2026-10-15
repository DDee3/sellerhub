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

export interface OrderDetail {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_facebook: string | null;
  order_type: "stock" | "preorder";
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  payment_method: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
  shipment_id: string | null;
  items: {
    id: string;
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
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

interface RawOrderDetailRow {
  id: string;
  shop_id: string;
  customer_id: string;
  shipment_id: string | null;
  order_type: "stock" | "preorder";
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  payment_method: string;
  status: string;
  note: string | null;
  created_at: string;
  customers: {
    name: string;
    phone: string | null;
    facebook_name: string | null;
  } | null;
  order_items: {
    id: string;
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[] | null;
}

function mapOrderStatus(status: string): OrderStatus {
  if (
    status === "confirmed" ||
    status === "delivered" ||
    status === "cancelled"
  ) {
    return status;
  }
  if (status === "paid" || status === "packed" || status === "shipped") {
    return "confirmed";
  }
  return "pending";
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
    return {
      id: order.id,
      customer_name: order.customers?.name || "အမည်မသိ ဖောက်သည်",
      order_type: order.order_type,
      total_price: order.total_price,
      deposit_paid: order.deposit_paid,
      balance_due: order.balance_due,
      status: mapOrderStatus(order.status),
      created_at: order.created_at,
      items_count: order.order_items?.length || 0,
    };
  });
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!shop) {
    console.log("[order-detail] no shop found for user:", user.id);
    return null;
  }

  const selectColumns = `id, shop_id, customer_id, shipment_id, order_type, total_price, deposit_paid, balance_due, payment_method, status, note, created_at, customers(name, phone, facebook_name), order_items(*)`;

  const { data, error } = await supabase
    .from("orders")
    .select<string, RawOrderDetailRow>(selectColumns)
    .eq("id", id)
    .eq("shop_id", shop.id)
    .maybeSingle();

  console.log("[order-detail] id:", id, "shop:", shop.id, "result:", data, "error:", error);

  if (error || !data) {
    if (error) console.error("Error fetching order by ID:", error);
    return null;
  }

  return {
    id: data.id,
    customer_id: data.customer_id,
    customer_name: data.customers?.name || "အမည်မသိ ဖောက်သည်",
    customer_phone: data.customers?.phone || null,
    customer_facebook: data.customers?.facebook_name || null,
    order_type: data.order_type,
    total_price: data.total_price,
    deposit_paid: data.deposit_paid,
    balance_due: data.balance_due,
    payment_method: data.payment_method,
    status: mapOrderStatus(data.status),
    note: data.note,
    created_at: data.created_at,
    shipment_id: data.shipment_id,
    items: data.order_items || [],
  };
}
