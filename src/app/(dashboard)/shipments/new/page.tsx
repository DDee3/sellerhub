import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ShipmentForm } from "@/components/shipments/shipment-form";
import { cn } from "@/lib/utils";

export default function NewShipmentPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Back button and header */}
      <div className="flex items-center gap-3">
        <Link
          href="/shipments"
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
            ပို့ဆောင်မှုအသစ်
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ကုန်ပစ္စည်း တင်သွင်း/မှာယူမှု အချက်အလက်များ ဖြည့်စွက်ပါ
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-white border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">
            ပို့ဆောင်မှုအသစ်
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ShipmentForm />
        </CardContent>
      </Card>
    </div>
  );
}

