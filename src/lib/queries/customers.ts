import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  facebook_name: string | null;
  telegram_username: string | null;
  address: string | null;
  orders_count: number;
  total_spent: number;
  outstanding_balance: number;
};

interface RawCustomerOrder {
  id: string;
  total_price: number;
  balance_due: number;
  status: string;
}

interface RawCustomerQueryRow {
  id: string;
  name: string;
  phone: string | null;
  facebook_name: string | null;
  telegram_username: string | null;
  address: string | null;
  orders: RawCustomerOrder[] | null;
}

export async function getCustomers(opts: {
  search?: string;
}): Promise<CustomerRow[]> {
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
    .from("customers")
    .select<string, RawCustomerQueryRow>(
      "id, name, phone, facebook_name, telegram_username, address, orders(id, total_price, balance_due, status)"
    )
    .eq("shop_id", shop.id);

  if (opts.search && opts.search.trim() !== "") {
    const s = opts.search.trim();
    query = query.or(
      `name.ilike.%${s}%,phone.ilike.%${s}%,facebook_name.ilike.%${s}%`
    );
  }

  const { data, error } = await query.order("name");

  if (error || !data) {
    console.error("Error fetching customers:", error);
    return [];
  }

  return data.map((customer): CustomerRow => {
    const ordersList = customer.orders ?? [];
    const validOrders = ordersList.filter((o) => o.status !== "cancelled");
    const orders_count = validOrders.length;

    const total_spent = ordersList
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

    const outstanding_balance = ordersList
      .filter((o) => o.status === "pending" || o.status === "confirmed")
      .reduce((sum, o) => sum + (Number(o.balance_due) || 0), 0);

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      facebook_name: customer.facebook_name,
      telegram_username: customer.telegram_username,
      address: customer.address,
      orders_count,
      total_spent,
      outstanding_balance,
    };
  });
}

