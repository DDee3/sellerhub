import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getCustomers(opts: { search?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!shop) return [];

  let query = supabase
    .from("customers")
    .select("*")
    .eq("shop_id", shop.id);

  if (opts.search) {
    query = query.ilike("name", `%${opts.search}%`);
  }

  const { data, error } = await query.order("name");

  if (error) {
    console.error("Error fetching customers:", JSON.stringify(error, null, 2));
    return [];
  }
  return data;
}
