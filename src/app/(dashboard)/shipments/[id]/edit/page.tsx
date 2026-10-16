"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ShipmentForm } from "@/components/shipments/shipment-form";
import type { ShipmentFormValues } from "@/lib/validations/shipment";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface EditShipmentPageProps {
  params: Promise<{ id: string }>;
}

export default function EditShipmentPage({ params }: EditShipmentPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [initialValues, setInitialValues] = useState<ShipmentFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!shop) {
        if (isMounted) notFound();
        return;
      }

      const { data: shipment, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("id", id)
        .eq("shop_id", shop.id)
        .maybeSingle();

      if (error || !shipment) {
        if (isMounted) notFound();
        return;
      }

      if (isMounted) {
        setInitialValues({
          name: shipment.name,
          source: shipment.source ?? "",
          order_date: shipment.order_date ?? "",
          arrive_date: shipment.arrive_date ?? "",
          status: shipment.status,
          total_cost: shipment.total_cost ?? 0,
          note: shipment.note ?? "",
        });
        setLoading(false);
      }
    }

    loadData();

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

  if (!initialValues) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/shipments/${id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-10 w-10 border-border bg-card text-foreground shadow-soft hover:bg-muted"
          )}
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">{t("shipments.form.back")}</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("shipments.form.edit_title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("shipments.new.subtitle")}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-card text-card-foreground border-border shadow-soft">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-base font-semibold text-foreground">
            {t("shipments.form.edit_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ShipmentForm initialValues={initialValues} shipmentId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
