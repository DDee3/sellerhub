import "server-only";
import { createClient } from "@/lib/supabase/server";

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
    .single();

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

