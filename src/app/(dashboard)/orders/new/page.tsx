import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderNewView } from "@/components/orders/order-new-view";

export default async function NewOrderPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    redirect("/signup");
  }

  const [productsRes, customersRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, price, type, stock_qty, deposit_percent")
      .eq("shop_id", shop.id)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("customers")
      .select("id, name, phone")
      .eq("shop_id", shop.id)
      .order("name", { ascending: true }),
  ]);

  const products = (productsRes.data ?? []).map((p) => ({
    ...p,
    price: Number(p.price) || 0,
    stock_qty: Number(p.stock_qty) || 0,
    deposit_percent: Number(p.deposit_percent) || 0,
  }));
  const customers = customersRes.data ?? [];

  return <OrderNewView products={products} customers={customers} />;
}
