"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CustomerForm } from "@/components/customers/customer-form";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

export default function NewCustomerPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Back button and header */}
      <div className="flex items-center gap-3">
        <Link
          href="/customers"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-9 w-9 rounded-full border-border bg-card text-foreground shadow-stripi-1 hover:bg-muted"
          )}
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">{t("customers.form.back")}</span>
        </Link>
        <div>
          <h1 className="text-3xl font-light tracking-[-0.64px] text-foreground">
            {t("customers.new.title")}
          </h1>
          <p className="text-[13px] font-light text-muted-foreground mt-0.5">
            {t("customers.new.subtitle")}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-card text-card-foreground border-border rounded-xl shadow-stripi-1">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-light tracking-[-0.26px] text-foreground">
            {t("customers.form.card_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
