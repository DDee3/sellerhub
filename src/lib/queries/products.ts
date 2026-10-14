import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Product = {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  type: "stock" | "preorder" | "hybrid";
  stock_qty: number;
  low_stock_alert: number;
  deposit_percent: number;
  source: string | null;
  is_active: boolean;
};

type GetProductsOpts = {
  search?: string;
  type?: string;
  active?: string;
};

export async function getProducts(opts: GetProductsOpts): Promise<Product[]> {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // 2. Get user's shop
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return [];

  // 3. Build query
  let query = supabase
    .from("products")
    .select(
      "id, name, image_url, price, type, stock_qty, low_stock_alert, deposit_percent, source, is_active"
    )
    .eq("shop_id", shop.id);

  if (opts.search) {
    query = query.ilike("name", `%${opts.search}%`);
  }

  if (opts.type && opts.type !== "all") {
    query = query.eq("type", opts.type as "stock" | "preorder" | "hybrid");
  }

  if (opts.active === "active") {
    query = query.eq("is_active", true);
  } else if (opts.active === "inactive") {
    query = query.eq("is_active", false);
  }

  const { data, error } = await query.order("name");

  if (error) {
    console.error("[getProducts] error:", error);
    return [];
  }

  return (data ?? []) as Product[];
}
