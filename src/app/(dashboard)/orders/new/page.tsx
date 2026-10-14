import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { OrderForm } from "@/components/orders/order-form";
import { cn } from "@/lib/utils";

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

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Top back navigation and header */}
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-10 w-10 border-slate-200 bg-white shadow-xs"
          )}
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
          <span className="sr-only">နောက်သို့</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            အော်ဒါအသစ်
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ဖောက်သည် အော်ဒါအချက်အလက်များ ဖြည့်စွက်ပါ
          </p>
        </div>
      </div>

      {/* Order Form */}
      <OrderForm products={products} customers={customers} />
    </div>
  );
}
