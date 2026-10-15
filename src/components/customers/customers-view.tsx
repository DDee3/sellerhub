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
  phone: string | null;
  facebook_name: string | null;
  orders_count: number;
  outstanding_balance: number;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("customers.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {customers.length} {t("customers.subtitle")}
          </p>
        </div>
        <Link
          href="/customers/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full sm:w-auto inline-flex items-center justify-center h-9 gap-1.5 px-4 text-sm font-semibold rounded-full shadow-soft hover:shadow-lift"
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
        <Card className="flex flex-col items-center justify-center p-10 text-center bg-card border-border/60 rounded-2xl shadow-soft">
          <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {t("customers.empty_title")}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {searchQuery ? (
              t("customers.empty_search")
            ) : (
              <Link
                href="/customers/new"
                className="text-primary hover:underline font-medium"
              >
                {t("customers.empty_action")}
              </Link>
            )}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => {
            const initial = [...customer.name.trim()][0]?.toUpperCase() || "C";
            return (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="block group"
              >
                <div className="py-3 px-4 flex items-center gap-4 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors shadow-soft cursor-pointer">
                  {/* LEFT: 38px circle avatar */}
                  <div className="h-9.5 w-9.5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0 select-none">
                    {initial}
                  </div>

                  {/* MIDDLE */}
                  <div className="flex-1 min-w-0 text-left space-y-0.5">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {customer.phone || t("customers.no_phone")}
                      {customer.facebook_name && ` · FB: ${customer.facebook_name}`}
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {customer.orders_count} {t("customers.orders_suffix")}
                    </p>
                    <div className="mt-1">
                      {customer.outstanding_balance > 0 ? (
                        <p className="text-xs font-semibold text-amber-600">
                          {t("customers.outstanding_balance")} {customer.outstanding_balance.toLocaleString()} {t("currency")}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground font-medium">
                          {t("customers.settled")}
                        </p>
                      )}
                    </div>
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

