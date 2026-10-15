"use client";

import Link from "next/link";
import { Package, Plus } from "lucide-react";

import { ProductFilters } from "@/components/products/product-filters";
import { ProductThumbnail } from "@/components/products/product-thumbnail";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import type { ProductType } from "@/types/database";

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  type: ProductType;
  stock_qty: number;
  low_stock_alert: number;
  source: string | null;
  image_url: string | null;
  is_active: boolean;
}

interface ProductsViewProps {
  products: ProductItem[];
  searchQuery?: string;
  typeFilter?: string;
  activeFilter?: string;
}

export function ProductsView({
  products,
  searchQuery,
  typeFilter,
  activeFilter,
}: ProductsViewProps) {
  const { t } = useLanguage();

  function renderTypeBadge(type: ProductType) {
    if (type === "stock") {
      return (
        <Badge
          variant="default"
          className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          {t("products.badge_stock")}
        </Badge>
      );
    }
    if (type === "preorder") {
      return (
        <Badge
          variant="secondary"
          className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
        >
          {t("products.badge_preorder")}
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-[11px] px-1.5 py-0 h-5 ml-2 shrink-0 font-normal"
      >
        {t("products.badge_hybrid")}
      </Badge>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("products.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} {t("products.subtitle")}
          </p>
        </div>
        <Link
          href="/products/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full sm:w-auto inline-flex items-center justify-center h-9 gap-1.5 px-4 text-sm font-semibold rounded-full shadow-soft hover:shadow-lift"
          )}
        >
          <Plus className="h-4 w-4" />
          {t("products.add_button")}
        </Link>
      </div>

      {/* Filters */}
      <ProductFilters />

      {/* Empty state or Products list */}
      {products.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center bg-card border-border/60 rounded-2xl shadow-soft">
          <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {t("products.empty_title")}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {searchQuery || typeFilter !== undefined || activeFilter !== undefined
              ? t("products.empty_search")
              : t("products.empty_action")}
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
              <div className="py-3 px-4 flex items-center gap-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors shadow-soft cursor-pointer">
                {/* LEFT */}
                <ProductThumbnail
                  src={product.image_url}
                  alt={product.name}
                  size={44}
                />

                {/* MIDDLE */}
                <div className="flex-1 min-w-0 text-left space-y-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {product.name}
                    </span>
                    {renderTypeBadge(product.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      {Number(product.price).toLocaleString()} {t("currency")}
                    </p>
                    {product.source && (
                      <p className="text-xs text-muted-foreground truncate">
                        • {t("products.source_prefix")} {product.source}
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right shrink-0">
                  {product.type !== "preorder" ? (
                    <div>
                      <p className="text-[11px] text-muted-foreground">
                        {t("products.stock_remaining")}
                      </p>
                      <p className="text-base font-bold text-foreground tabular-nums leading-none mt-0.5">
                        {product.stock_qty}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t("products.badge_preorder")}
                    </p>
                  )}
                  {!product.is_active && (
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 text-muted-foreground font-normal"
                      >
                        {t("products.badge_inactive")}
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

export default ProductsView;

