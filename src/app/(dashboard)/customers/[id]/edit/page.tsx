import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CustomerForm } from "@/components/customers/customer-form";
import type { CustomerFormValues } from "@/lib/validations/customer";
import { cn } from "@/lib/utils";

interface EditCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!shop) {
    notFound();
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("shop_id", shop.id)
    .maybeSingle();

  if (!customer) {
    notFound();
  }

  const initialValues: CustomerFormValues = {
    name: customer.name,
    phone: customer.phone ?? "",
    facebook_name: customer.facebook_name ?? "",
    telegram_username: customer.telegram_username ?? "",
    address: customer.address ?? "",
    note: customer.note ?? "",
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/customers/${id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "h-10 w-10 border-slate-200 bg-white shadow-xs"
          )}
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
          <span className="sr-only">နောက်သို့</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ဝယ်ယူသူ ပြင်ဆင်
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ဝယ်ယူသူ အချက်အလက်များကို ပြင်ဆင်ပါ
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">
            ဝယ်ယူသူအချက်အလက်
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <CustomerForm initialValues={initialValues} customerId={id} />
        </CardContent>
      </Card>
    </div>
  );
}

