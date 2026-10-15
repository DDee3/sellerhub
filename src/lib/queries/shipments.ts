import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/queries/orders";

export type ShipmentStatus =
  | "ordering"
  | "in_transit"
  | "arrived"
  | "delivering"
  | "completed";

export interface ShipmentRow {
  id: string;
  name: string;
  source: string | null;
  order_date: string | null;
  arrive_date: string | null;
  status: ShipmentStatus;
  total_cost: number | null;
  orders_count: number;
}

export type ShipmentOrder = {
  id: string;
  customer_name: string;
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  status: OrderStatus;
  items_count: number;
};

export type ShipmentDetail = {
  id: string;
  name: string;
  source: string | null;
  order_date: string | null;
  arrive_date: string | null;
  status: ShipmentStatus;
  total_cost: number | null;
  note: string | null;
  orders: ShipmentOrder[];
};

export type UnassignedPreorderOrder = {
  id: string;
  customer_name: string;
  total_price: number;
  items_count: number;
};

interface RawShipmentQueryRow {
  id: string;
  name: string;
  source: string | null;
  order_date: string | null;
  arrive_date: string | null;
  status: ShipmentStatus;
  total_cost: number | null;
  orders: { id: string }[] | null;
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

export async function getShipments(opts: {
  search?: string;
  status?: string;
}): Promise<ShipmentRow[]> {
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
    .maybeSingle();

  if (!shop) {
    return [];
  }

  let query = supabase
    .from("shipments")
    .select<string, RawShipmentQueryRow>(
      "id, name, source, order_date, arrive_date, status, total_cost, orders(id)"
    )
    .eq("shop_id", shop.id);

  if (opts.search) {
    query = query.ilike("name", `%${opts.search}%`);
  }

  if (opts.status && opts.status !== "all") {
    query = query.eq("status", opts.status as ShipmentStatus);
  }

  const { data, error } = await query.order("order_date", {
    ascending: false,
    nullsFirst: false,
  });

  if (error || !data) {
    console.error("Error fetching shipments:", error);
    return [];
  }

  return data.map((shipment): ShipmentRow => {
    return {
      id: shipment.id,
      name: shipment.name,
      source: shipment.source,
      order_date: shipment.order_date,
      arrive_date: shipment.arrive_date,
      status: shipment.status,
      total_cost: shipment.total_cost,
      orders_count: shipment.orders?.length ?? 0,
    };
  });
}

interface RawShipmentOrderRow {
  id: string;
  total_price: number;
  deposit_paid: number;
  balance_due: number;
  status: string;
  customers: { name: string } | { name: string }[] | null;
  order_items: { id: string }[] | null;
}

interface RawUnassignedOrderRow {
  id: string;
  order_type: string;
  status: string;
  shipment_id: string | null;
  total_price: number;
  customers: { name: string } | { name: string }[] | null;
  order_items: { id: string }[] | null;
}

export async function getShipmentById(
  id: string
): Promise<ShipmentDetail | null> {
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
    return null;
  }

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, name, source, order_date, arrive_date, status, total_cost, note")
    .eq("id", id)
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (shipmentError || !shipment) {
    return null;
  }

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select<string, RawShipmentOrderRow>(
      "id, total_price, deposit_paid, balance_due, status, customers(name), order_items(id)"
    )
    .eq("shipment_id", id)
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching shipment orders:", ordersError);
  }

  const orders: ShipmentOrder[] = (ordersData ?? []).map((o) => {
    const custName = Array.isArray(o.customers)
      ? o.customers[0]?.name
      : o.customers?.name;
    const itemsCount = o.order_items?.length || 0;
    return {
      id: o.id,
      customer_name: custName || "အမည်မသိ ဖောက်သည်",
      total_price: o.total_price,
      deposit_paid: o.deposit_paid,
      balance_due: o.balance_due,
      status: mapOrderStatus(o.status),
      items_count: itemsCount,
    };
  });

  return {
    id: shipment.id,
    name: shipment.name,
    source: shipment.source,
    order_date: shipment.order_date,
    arrive_date: shipment.arrive_date,
    status: shipment.status as ShipmentStatus,
    total_cost: shipment.total_cost,
    note: shipment.note,
    orders,
  };
}

export async function getUnassignedPreorderOrders(): Promise<
  UnassignedPreorderOrder[]
> {
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
    .maybeSingle();

  if (!shop) {
    return [];
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select<string, RawUnassignedOrderRow>(
      "id, total_price, customers(name), order_items(id)"
    )
    .eq("shop_id", shop.id)
    .eq("order_type", "preorder")
    .is("shipment_id", null)
    .neq("status", "cancelled")
    .neq("status", "delivered")
    .order("created_at", { ascending: false });

  if (error || !orders) {
    console.error("Error fetching unassigned preorder orders:", error);
    return [];
  }

  return orders.map((o) => {
    const custName = Array.isArray(o.customers)
      ? o.customers[0]?.name
      : o.customers?.name;
    const itemsCount = o.order_items?.length || 0;
    return {
      id: o.id,
      customer_name: custName || "အမည်မသိ ဖောက်သည်",
      total_price: o.total_price,
      items_count: itemsCount,
    };
  });
}
