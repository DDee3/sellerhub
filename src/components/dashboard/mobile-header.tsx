"use client";

import Link from "next/link";
import { Store } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MobileHeader({ shopName }: { shopName?: string }) {
  return (
    <header className="flex md:hidden h-14 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sticky top-0 z-40 select-none">
      {/* Brand / Logo on Left */}
      <Link href="/dashboard" className="flex items-center gap-2.5 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Store className="h-4 w-4 text-primary" />
        </div>
        <span className="font-bold text-base tracking-tight text-foreground">
          SellerHub
        </span>
      </Link>

      {/* Right controls: Theme toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-0.5 rounded-full bg-muted/50 border border-border/50">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default MobileHeader;
