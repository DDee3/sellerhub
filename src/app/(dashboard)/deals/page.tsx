import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Deals | exchange",
};

export default function DealsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Deals</h1>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>

      <div>
        <Link
          href="/deals/new"
          className={cn(buttonVariants({ variant: "default" }), "inline-flex items-center gap-1.5 h-9 text-xs")}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record a new deal</span>
        </Link>
      </div>
    </div>
  );
}

