"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MobileHeader({ shopName }: { shopName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex md:hidden h-14 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sticky top-0 z-40">
      {/* Hamburger button with Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full active:scale-95"
              aria-label="မနူးဖွင့်ရန်"
            />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-4 pt-6 bg-card flex flex-col border-border/60">
          <SheetTitle className="sr-only">လမ်းညွှန် မနူး</SheetTitle>
          <SidebarNav
            shopName={shopName}
            onNavigate={() => setOpen(false)}
            className="flex static w-full h-full border-0 p-0 shadow-none z-auto bg-transparent"
          />
        </SheetContent>
      </Sheet>

      {/* Logo in Center */}
      <Link href="/dashboard" className="flex items-center gap-2 select-none group">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-soft transition-transform group-hover:scale-105">
          <Store className="h-4 w-4" />
        </div>
        <span className="font-bold text-base tracking-tight text-foreground">
          SellerHub
        </span>
      </Link>

      {/* Right controls: Theme toggle */}
      <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-full border border-border/50">
        <ThemeToggle />
      </div>
    </header>
  );
}

export default MobileHeader;
