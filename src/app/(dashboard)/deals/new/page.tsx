import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DealForm } from "@/components/deals/deal-form";

export const metadata = {
  title: "Record a Deal | exchange",
};

export default function NewDealPage() {
  return (
    <div className="space-y-6 max-w-xl">
      {/* Back link & Title */}
      <div className="space-y-2">
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Deals</span>
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Record a Deal
        </h1>
      </div>

      {/* Form Container */}
      <DealForm />
    </div>
  );
}

