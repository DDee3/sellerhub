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
  if (type === "stock") {
    return (
      <Badge
        variant="default"
        className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
      >
        လက်ကျန်
      </Badge>
    );
  }
  if (type === "preorder") {
    return (
      <Badge
        variant="secondary"
        className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
      >
        ကြိုမှာ
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
    >
      နှစ်မျိုးရော
    </Badge>
  );
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ပစ္စည်းများ
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} မျိုး ရှိသည်
          </p>
        </div>
        <Link
          href="/products/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "flex w-full sm:w-auto h-10 items-center justify-center gap-1.5 px-4 font-medium shadow-xs"
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
              : '"အသစ်ထည့်" ကိုနှိပ်၍ ပစ္စည်းအသစ် ထည့်ပါ'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="block group"
            >
              <div className="p-3 flex items-center gap-3 hover:bg-slate-50 transition rounded-xl border bg-white border-slate-200/80 shadow-xs cursor-pointer">
                {/* LEFT */}
                <ProductThumbnail
                  src={product.image_url}
                  alt={product.name}
                  size={72}
                />

                {/* MIDDLE */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center min-w-0">
                    <span className="font-medium text-base text-slate-900 truncate">
                      {product.name}
                    </span>
                    <TypeBadge type={product.type} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    {Number(product.price).toLocaleString()} ကျပ်
                  </p>
                  {product.source && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      မူရင်း: {product.source}
                    </p>
                  )}
                </div>

                {/* RIGHT */}
                <div className="text-right shrink-0">
                  {product.type !== "preorder" ? (
                    <div>
                      <p className="text-xs text-muted-foreground">လက်ကျန်</p>
                      <p className="text-lg font-bold text-slate-900 tabular-nums">
                        {product.stock_qty}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-slate-400">
                      ကြိုမှာ
                    </p>
                  )}
                  {!product.is_active && (
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 text-slate-400 border-slate-300 font-normal"
                      >
                        မလှုပ်ရှားသော
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
