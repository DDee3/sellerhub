import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ProductForm } from "@/components/products/product-form";
import type { ProductFormValues } from "@/lib/validations/product";
import { cn } from "@/lib/utils";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  const initialValues: ProductFormValues = {
    name: product.name,
    image_url: product.image_url ?? "",
    price: product.price,
    type: product.type,
    stock_qty: product.stock_qty,
    low_stock_alert: product.low_stock_alert,
    deposit_percent: product.deposit_percent,
    source: product.source ?? "",
    description: product.description ?? "",
    is_active: product.is_active,
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Back button and header */}
      <div className="flex items-center gap-3">
        <Link
          href="/products"
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
            ပစ္စည်း ပြင်ဆင်
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ပစ္စည်း၏ အချက်အလက်များကို ပြင်ဆင်ပါ
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">
            ပစ္စည်းအချက်အလက်
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ProductForm initialValues={initialValues} productId={id} />
        </CardContent>
      </Card>
    </div>
  );
}

