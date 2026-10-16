import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductEditView } from "@/components/products/product-edit-view";
import type { ProductFormValues } from "@/lib/validations/product";

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
    cost_price: product.cost_price ?? null,
    type: product.type,
    stock_qty: product.stock_qty,
    low_stock_alert: product.low_stock_alert,
    deposit_percent: product.deposit_percent,
    source: product.source ?? "",
    description: product.description ?? "",
    is_active: product.is_active,
  };

  return <ProductEditView initialValues={initialValues} productId={id} />;
}
