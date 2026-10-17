"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { DeleteCustomerButton } from "@/components/customers/delete-customer-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

interface CustomerData {
  id: string;
  name: string;
  phone: string | null;
  facebook_name: string | null;
  telegram_username: string | null;
  address: string | null;
  note: string | null;
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchCustomerData() {
      const supabase = createClient();

      const { data: customerData, error: customerErr } = await supabase
        .from("customers")
        .select("id, name, phone, facebook_name, telegram_username, address, note")
        .eq("id", id)
        .maybeSingle();

      if (customerErr || !customerData) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setCustomer(customerData);
        setLoading(false);
      }
    }

    fetchCustomerData();

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

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-9 w-9 rounded-full border-border bg-card text-foreground hover:bg-muted shadow-stripi-1 shrink-0"
            )}
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">{t("back")}</span>
          </Link>
          <div>
            <h1 className="text-3xl font-light tracking-[-0.64px] text-foreground">
              {customer.name}
            </h1>
            <p className="text-[13px] font-light text-muted-foreground mt-0.5">
              {customer.phone || t("customers.no_phone")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 font-normal rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Pencil className="h-4 w-4" />
            {t("common.edit")}
          </Link>
          <DeleteCustomerButton
            customerId={id}
            customerName={customer.name}
            ordersCount={0}
          />
        </div>
      </div>

      {/* Customer Info Card */}
      <Card className="bg-card text-card-foreground border-border shadow-stripi-1 rounded-xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-base font-light tracking-[-0.26px] text-foreground">
            {t("customers.detail.info")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {customer.phone && (
            <div>
              <span className="text-xs font-light text-muted-foreground block">
                {t("customers.detail.phone")}
              </span>
              <a
                href={`tel:${customer.phone}`}
                className="font-normal text-primary hover:underline"
              >
                {customer.phone}
              </a>
            </div>
          )}

          {customer.facebook_name && (
            <div>
              <span className="text-xs font-light text-muted-foreground block">
                {t("customers.detail.facebook")}
              </span>
              <span className="font-normal text-foreground">
                {customer.facebook_name}
              </span>
            </div>
          )}

          {customer.telegram_username && (
            <div>
              <span className="text-xs font-light text-muted-foreground block">
                Telegram
              </span>
              <span className="font-normal text-foreground">
                {customer.telegram_username}
              </span>
            </div>
          )}

          {customer.address && (
            <div className="sm:col-span-2">
              <span className="text-xs font-light text-muted-foreground block">
                {t("customers.detail.address")}
              </span>
              <p className="font-light text-foreground whitespace-pre-wrap mt-0.5">
                {customer.address}
              </p>
            </div>
          )}

          {customer.note && (
            <div className="sm:col-span-2">
              <span className="text-xs font-light text-muted-foreground block">
                {t("customers.form.note")}
              </span>
              <p className="text-foreground font-light whitespace-pre-wrap mt-0.5 bg-canvas-soft p-4 rounded-xl border border-border">
                {customer.note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
