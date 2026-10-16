"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ProductForm } from "@/components/products/product-form";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export default function NewProductPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Back button and header */}
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
            {t("products.new.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("products.new.subtitle")}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-card text-card-foreground border-border shadow-soft rounded-2xl">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("products.new.card_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
