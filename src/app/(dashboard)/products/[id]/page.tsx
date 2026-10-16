"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProductThumbnail } from "@/components/products/product-thumbnail";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

function TypeBadge({
  type,
  t,
}: {
  type: "stock" | "preorder" | "hybrid";
  t: (key: string) => string;
}) {
  if (type === "stock") return <Badge variant="default">{t("products.badge_stock")}</Badge>;
  if (type === "preorder") return <Badge variant="secondary">{t("products.badge_preorder")}</Badge>;
  return <Badge variant="outline">{t("products.badge_hybrid")}</Badge>;
}

export default function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        if (isMounted) notFound();
        return;
      }

      if (isMounted) {
        setProduct(data);
        setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const marginValue =
    product.cost_price != null && product.price > 0
      ? ((product.price - product.cost_price) / product.price) * 100
      : null;
  const marginFormatted =
    marginValue !== null ? marginValue.toFixed(1) : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Top back navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-10 w-10 rounded-xl border-border bg-card text-foreground hover:bg-muted shadow-soft"
          )}
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">{t("back")}</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("products.detail.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("products.detail.subtitle")}
          </p>
        </div>
      </div>

      {/* Main product detail card */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl overflow-hidden">
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
          <div className="space-y-3 border-b border-border pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                  <p className="text-lg font-bold text-primary">
                    {product.price.toLocaleString()} {t("currency")}
                  </p>
                  {marginValue !== null && marginFormatted !== null && (
                    <Badge
                      className={cn(
                        "text-xs px-2 py-0.5 font-medium border-0 shadow-none",
                        marginValue > 20
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : marginValue >= 10
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      )}
                    >
                      {t("products.detail.margin")}: {marginFormatted}%
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={product.type} t={t} />
                {product.is_active ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                    {t("products.filter_active")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-border">
                    {t("products.filter_inactive")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Attribute grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* Stock Quantity */}
            <div className="p-3.5 bg-muted rounded-xl border border-border">
              <span className="text-muted-foreground text-xs block mb-1">
                {t("products.detail.stock_qty")}
              </span>
              <span className="font-semibold text-foreground">
                {product.type === "preorder"
                  ? t("products.badge_preorder")
                  : `${product.stock_qty} ${t("dashboard.units")}`}
              </span>
              {product.type !== "preorder" &&
                product.stock_qty <= product.low_stock_alert && (
                  <span className="text-xs text-destructive block mt-0.5 font-medium">
                    {t("dashboard.alert_threshold")}: {product.low_stock_alert} {t("dashboard.units")}
                  </span>
                )}
            </div>

            {/* Margin tile next to Stock (only if cost_price is set) */}
            {product.cost_price != null && marginValue !== null && marginFormatted !== null && (
              <div className="p-3.5 bg-muted rounded-xl border border-border">
                <span className="text-muted-foreground text-xs block mb-1">
                  {t("products.detail.margin")}
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "text-xs px-2.5 py-0.5 font-medium border-0 shadow-none",
                      marginValue > 20
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : marginValue >= 10
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    )}
                  >
                    {marginFormatted}%
                  </Badge>
                </div>
              </div>
            )}

            {/* Cost Price tile (only if cost_price is set) */}
            {product.cost_price != null && (
              <div className="p-3.5 bg-muted rounded-xl border border-border">
                <span className="text-muted-foreground text-xs block mb-1">
                  {t("products.detail.cost_price")}
                </span>
                <span className="font-semibold text-foreground">
                  {product.cost_price.toLocaleString()} {t("currency")}
                </span>
              </div>
            )}

            {/* Deposit Percent */}
            {product.type !== "stock" && (
              <div className="p-3.5 bg-muted rounded-xl border border-border">
                <span className="text-muted-foreground text-xs block mb-1">
                  {t("products.form.deposit_percent")}
                </span>
                <span className="font-semibold text-foreground">
                  {product.deposit_percent}%
                </span>
              </div>
            )}

            {/* Source */}
            {product.source && (
              <div className="p-3.5 bg-muted rounded-xl border border-border">
                <span className="text-muted-foreground text-xs block mb-1">
                  {t("products.detail.source")}
                </span>
                <span className="font-semibold text-foreground">
                  {product.source}
                </span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="p-3.5 bg-muted rounded-xl border border-border sm:col-span-2">
                <span className="text-muted-foreground text-xs block mb-1">
                  {t("products.form.description")}
                </span>
                <p className="text-foreground whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href={`/products/${id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "gap-1.5 h-10 px-4 font-medium rounded-xl border-border bg-card text-foreground hover:bg-muted shadow-soft"
              )}
            >
              <Pencil className="h-4 w-4" />
              {t("edit")}
            </Link>
            <DeleteProductButton productId={id} productName={product.name} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
