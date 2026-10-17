"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { CustomerFilters } from "@/components/customers/customer-filters";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

export interface CustomerItem {
  id: string;
  name: string;
  phone?: string | null;
  facebook_name?: string | null;
  [key: string]: unknown;
}

interface CustomersViewProps {
  customers: CustomerItem[];
  searchQuery?: string;
}

export function CustomersView({
  customers,
  searchQuery,
}: CustomersViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-light tracking-[-0.64px] text-foreground">
            {t("customers.title")}
          </h1>
          <p className="text-[15px] font-light text-muted-foreground mt-1">
            {customers.length} {t("customers.subtitle")}
          </p>
        </div>
        <Link
          href="/customers/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full sm:w-auto inline-flex items-center justify-center h-9 gap-1.5 px-4 text-sm font-normal rounded-full shadow-stripi-1"
          )}
        >
          <Plus className="h-4 w-4" />
          {t("customers.add_button")}
        </Link>
      </div>

      {/* Filters */}
      <CustomerFilters />

      {/* Empty state or Customers List */}
      {customers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-card border-border rounded-xl shadow-stripi-1">
          <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-base font-light tracking-[-0.22px] text-foreground">
            {t("customers.empty_title")}
          </p>
          <p className="text-xs font-light text-muted-foreground mt-1 max-w-xs">
            {searchQuery ? (
              t("customers.empty_search")
            ) : (
              <Link
                href="/customers/new"
                className="text-primary hover:underline font-normal"
              >
                {t("customers.empty_action")}
              </Link>
            )}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => {
            const initial =
              customer?.name?.trim()?.[0]?.toUpperCase() || "C";
            return (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="block group"
              >
                <div className="py-3 px-4 flex items-center gap-4 rounded-xl border border-border bg-card hover:bg-canvas-soft/80 transition-colors shadow-stripi-1 cursor-pointer">
                  {/* LEFT: circle avatar */}
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-normal text-xs shrink-0 select-none">
                    {initial}
                  </div>

                  {/* MIDDLE: Name, Phone, and Facebook */}
                  <div className="flex-1 min-w-0 text-left space-y-0.5">
                    <p className="font-normal text-sm text-foreground truncate">
                      {customer?.name || "—"}
                    </p>
                    <p className="text-xs font-light text-muted-foreground truncate">
                      {customer?.phone || t("customers.no_phone")}
                      {customer?.facebook_name && ` · FB: ${customer.facebook_name}`}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomersView;

