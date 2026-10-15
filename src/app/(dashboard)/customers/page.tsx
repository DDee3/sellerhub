import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { getCustomers } from "@/lib/queries/customers";
import { CustomerFilters } from "@/components/customers/customer-filters";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{
  q?: string;
}>;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const customers = await getCustomers({ search: params.q });

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ဝယ်ယူသူများ
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {customers.length} ဦး
          </p>
        </div>
        <Link
          href="/customers/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 gap-1.5 px-4 font-medium shadow-xs"
          )}
        >
          <Plus className="h-4 w-4" />
          ဝယ်ယူသူအသစ်
        </Link>
      </div>

      {/* Filters */}
      <CustomerFilters />

      {/* Empty state or Customers List */}
      {customers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center bg-white border-slate-200/80 shadow-xs">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Users className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            ဝယ်ယူသူ မရှိသေးပါ
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {params.q ? (
              "ရှာဖွေမှု ကိုက်ညီသော ဝယ်ယူသူ မတွေ့ပါ"
            ) : (
              <Link
                href="/customers/new"
                className="text-blue-600 hover:underline font-medium"
              >
                ဝယ်ယူသူအသစ် ထည့်ပါ
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
                <div className="p-3 flex items-center gap-3 hover:bg-slate-50 transition rounded-xl border border-slate-200/80 bg-white shadow-xs cursor-pointer">
                  {/* LEFT: circle avatar with first letter */}
                  <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-base shrink-0 select-none">
                    {initial}
                  </div>

                  {/* MIDDLE: Name & Phone / Facebook */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base text-slate-900 truncate group-hover:text-blue-600 transition">
                      {customer.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {customer.phone || "ဖုန်း မရှိပါ"}
                      {customer.facebook_name && ` · FB: ${customer.facebook_name}`}
                    </p>
                  </div>

                  {/* RIGHT: Orders count & Outstanding Balance */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {customer.orders_count} အော်ဒါ
                    </p>
                    <div className="mt-0.5">
                      {customer.outstanding_balance > 0 ? (
                        <p className="text-sm font-semibold text-amber-600">
                          ကျန် {customer.outstanding_balance.toLocaleString()} ကျပ်
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground font-medium">
                          ရှင်းပြီး
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
