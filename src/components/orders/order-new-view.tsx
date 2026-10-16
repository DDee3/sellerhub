"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { OrderForm, type OrderFormProduct, type OrderFormCustomer } from "@/components/orders/order-form";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface OrderNewViewProps {
  products: OrderFormProduct[];
  customers: OrderFormCustomer[];
}

export function OrderNewView({ products, customers }: OrderNewViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Top back navigation and header */}
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
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
            {t("orders.form.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("orders.form.subtitle")}
          </p>
        </div>
      </div>

      {/* Order Form */}
      <OrderForm products={products} customers={customers} />
    </div>
  );
}

export default OrderNewView;

