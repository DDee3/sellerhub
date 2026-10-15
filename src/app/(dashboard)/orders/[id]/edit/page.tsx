import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  OrderForm,
  type OrderFormProduct,
} from "@/components/orders/order-form";
import { cn } from "@/lib/utils";

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

interface RawOrderItem {
  product_id: string | null;
  quantity: number;
  product_name: string;
}

interface RawOrder {
  id: string;
  status: string;
  order_type: "stock" | "preorder";
  total_price: number;
  deposit_paid: number;
  payment_method: "kbz_pay" | "wave_pay" | "cash" | "cod";
  note: string | null;
  customers: { name: string } | { name: string }[] | null;
  order_items: RawOrderItem[] | null;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;
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
    .maybeSingle();

  if (!shop) {
    notFound();
  }

  const { data: order } = await supabase
    .from("orders")
    .select<string, RawOrder>(
      "id, status, order_type, total_price, deposit_paid, payment_method, note, customers(name), order_items(product_id, quantity, product_name)"
    )
    .eq("id", id)
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  if (order.status === "delivered" || order.status === "cancelled") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <div className="flex items-center gap-3">
          <Link
            href={`/orders/${id}`}
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
              အော်ဒါ ပြင်ဆင်
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              အော်ဒါ #{order.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <Card className="bg-white border-slate-200/80 shadow-xs p-8 text-center space-y-3">
          <p className="text-base font-semibold text-slate-800">
            ဤအော်ဒါကို ပြင်၍ မရပါ
          </p>
          <p className="text-xs text-muted-foreground">
            {order.status === "delivered"
              ? "ပို့ဆောင်ပြီးဖြစ်သော အော်ဒါများကို ပြင်ဆင်ခွင့် မရှိပါ။"
              : "ပယ်ဖျက်ထားသော အော်ဒါများကို ပြင်ဆင်ခွင့် မရှိပါ။"}
          </p>
          <div className="pt-2">
            <Link
              href={`/orders/${id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              အော်ဒါ အသေးစိတ်သို့ ပြန်သွားမည်
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { data: productsData } = await supabase
    .from("products")
    .select("id, name, price, type, stock_qty, deposit_percent")
    .eq("shop_id", shop.id)
    .eq("is_active", true)
    .order("name");

  const products: OrderFormProduct[] = (productsData ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    type: p.type as "stock" | "preorder" | "hybrid",
    stock_qty: p.stock_qty,
    deposit_percent: p.deposit_percent,
  }));

  const customerName = Array.isArray(order.customers)
    ? order.customers[0]?.name ?? ""
    : order.customers?.name ?? "";

  const items = (order.order_items ?? [])
    .filter((oi) => oi.product_id !== null)
    .map((oi) => ({
      product_id: oi.product_id as string,
      quantity: oi.quantity,
    }));

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/orders/${id}`}
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
            အော်ဒါ ပြင်ဆင်
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            အော်ဒါ #{order.id.slice(0, 8)} ၏ ပစ္စည်းနှင့် ငွေပေးချေမှု အချက်အလက်များ ပြင်ဆင်ပါ
          </p>
        </div>
      </div>

      <OrderForm
        orderId={id}
        products={products}
        initialValues={{
          items,
          deposit_paid: order.deposit_paid,
          payment_method: order.payment_method,
          note: order.note ?? "",
          customer_name: customerName,
          order_type: order.order_type,
        }}
      />
    </div>
  );
}

