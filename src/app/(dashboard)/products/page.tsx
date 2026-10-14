import Link from "next/link";
import { Package, Plus } from "lucide-react";

import { getProducts } from "@/lib/queries/products";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductThumbnail } from "@/components/products/product-thumbnail";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Next.js 15/16 — searchParams is a Promise
type SearchParams = Promise<{
  q?: string;
  type?: string;
  active?: string;
}>;

function TypeBadge({ type }: { type: "stock" | "preorder" | "hybrid" }) {
  if (type === "stock") return <Badge variant="default">Stock</Badge>;
  if (type === "preorder") return <Badge variant="secondary">Pre-order</Badge>;
  return <Badge variant="outline">Hybrid</Badge>;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const products = await getProducts({
    search: params.q,
    type: params.type,
    active: params.active,
  });

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ပစ္စည်းများ
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {products.length} မျိုး ရှိသည်
          </p>
        </div>
        <Link
          href="/products/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 gap-1.5 px-4 font-medium shadow-xs"
          )}
        >
          <Plus className="h-4 w-4" />
          အသစ်ထည့်
        </Link>
      </div>

      {/* Filters */}
      <ProductFilters />

      {/* Empty state */}
      {products.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center bg-white border-slate-200/80 shadow-xs">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Package className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            ပစ္စည်းများ မရှိသေးပါ
          </p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            {params.q || params.type !== undefined || params.active !== undefined
              ? "ရှာဖွေမှု ကိုက်ညီသော ပစ္စည်း မတွေ့ပါ"
              : "\"အသစ်ထည့်\" ကိုနှိပ်၍ ပစ္စည်းအသစ် ထည့်ပါ"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="block group"
            >
              <Card className="flex items-center gap-4 p-4 bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                {/* Product image or placeholder */}
                <div className="shrink-0">
                  <ProductThumbnail
                    src={product.image_url}
                    alt={product.name}
                  />
                </div>

                {/* Middle: name, type badge, price */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 truncate leading-tight">
                      {product.name}
                    </p>
                    <TypeBadge type={product.type} />
                    {!product.is_active && (
                      <Badge
                        variant="outline"
                        className="text-slate-400 border-slate-300 text-xs"
                      >
                        မလှုပ်ရှားသော
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {product.price.toLocaleString()} ကျပ်
                  </p>
                  {product.source && (
                    <p className="text-xs text-slate-400 truncate">
                      မှတ်ဆင့်: {product.source}
                    </p>
                  )}
                </div>

                {/* Right: stock qty */}
                <div className="shrink-0 text-right">
                  {product.type !== "preorder" ? (
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          product.stock_qty <= product.low_stock_alert
                            ? "text-red-600"
                            : "text-slate-700"
                        )}
                      >
                        လက်ကျန် {product.stock_qty}
                      </p>
                      {product.stock_qty <= product.low_stock_alert && (
                        <p className="text-xs text-red-400 mt-0.5">နည်းနေသည်</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Pre-order</p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
