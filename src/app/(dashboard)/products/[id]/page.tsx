import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProductThumbnail } from "@/components/products/product-thumbnail";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { cn } from "@/lib/utils";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

function TypeBadge({ type }: { type: "stock" | "preorder" | "hybrid" }) {
  if (type === "stock") return <Badge variant="default">Stock (လက်ကျန်)</Badge>;
  if (type === "preorder") return <Badge variant="secondary">Pre-order (ကြိုမှာ)</Badge>;
  return <Badge variant="outline">Hybrid (နှစ်မျိုးရော)</Badge>;
}

function MarginBadge({ price, costPrice }: { price: number; costPrice: number | null }) {
  if (costPrice == null) return null;

  const margin = price > 0 ? ((price - costPrice) / price) * 100 : 0;
  const formattedMargin = Number.isInteger(margin) ? margin : margin.toFixed(1);

  let colorClass = "bg-red-600 hover:bg-red-700 text-white";
  if (margin > 20) {
    colorClass = "bg-emerald-600 hover:bg-emerald-700 text-white";
  } else if (margin >= 10) {
    colorClass = "bg-amber-500 hover:bg-amber-600 text-white";
  }

  return (
    <Badge className={cn("text-xs px-2 py-0.5 font-medium border-0 shadow-none", colorClass)}>
      Margin: {formattedMargin}%
    </Badge>
  );
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
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

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Top back navigation */}
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
            ပစ္စည်းအသေးစိတ်
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ပစ္စည်း၏ အချက်အလက်များကို ကြည့်ရှုပါ
          </p>
        </div>
      </div>

      {/* Main product detail card */}
      <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
        <CardContent className="p-6 space-y-6">
          {/* Large Image on top */}
          <div className="flex justify-center py-2">
            <ProductThumbnail
              src={product.image_url}
              alt={product.name}
              size={200}
            />
          </div>

          {/* Title, price and badges */}
          <div className="space-y-3 border-b border-slate-100 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                  <p className="text-lg font-bold text-primary">
                    {product.price.toLocaleString()} ကျပ်
                  </p>
                  <MarginBadge price={product.price} costPrice={product.cost_price} />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={product.type} />
                {product.is_active ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                    အသက်ဝင်သည်
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-400 border-slate-300">
                    မလှုပ်ရှားသော
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Attribute grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {product.cost_price != null && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-xs block mb-1">
                  အရင်းဈေး
                </span>
                <span className="font-semibold text-slate-800">
                  {product.cost_price.toLocaleString()} ကျပ်
                </span>
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 text-xs block mb-1">
                လက်ကျန် အရေအတွက်
              </span>
              <span className="font-semibold text-slate-800">
                {product.type === "preorder" ? "Pre-order" : `${product.stock_qty} ခု`}
              </span>
              {product.type !== "preorder" &&
                product.stock_qty <= product.low_stock_alert && (
                  <span className="text-xs text-red-500 block mt-0.5 font-medium">
                    သတိပေးချက်: {product.low_stock_alert} ခုအောက် ရောက်နေသည်
                  </span>
                )}
            </div>

            {product.type !== "stock" && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-xs block mb-1">
                  စရံ ရာခိုင်နှုန်း
                </span>
                <span className="font-semibold text-slate-800">
                  {product.deposit_percent}%
                </span>
              </div>
            )}

            {product.source && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-xs block mb-1">
                  အရင်းအမြစ်
                </span>
                <span className="font-semibold text-slate-800">
                  {product.source}
                </span>
              </div>
            )}

            {product.description && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                <span className="text-slate-500 text-xs block mb-1">
                  မှတ်ချက်
                </span>
                <p className="text-slate-800 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href={`/products/${id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "gap-1.5 h-10 px-4 font-medium border-slate-200"
              )}
            >
              <Pencil className="h-4 w-4" />
              ပြင်ဆင်
            </Link>
            <DeleteProductButton productId={id} productName={product.name} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

