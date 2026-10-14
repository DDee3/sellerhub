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

export function MobileHeader({ shopName }: { shopName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex md:hidden h-14 items-center justify-between border-b border-slate-200/80 bg-white px-4 sticky top-0 z-40">
      {/* Hamburger button with Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-700"
              aria-label="မနူးဖွင့်ရန်"
            />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-4 pt-6 bg-white flex flex-col">
          <SheetTitle className="sr-only">လမ်းညွှန် မနူး</SheetTitle>
          <SidebarNav
            shopName={shopName}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Logo in Center */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
          <Store className="h-4 w-4" />
        </div>
        <span className="font-bold text-base tracking-tight text-slate-900">
          SellerHub
        </span>
      </Link>

      {/* Placeholder to balance hamburger for center logo */}
      <div className="w-9" />
    </header>
  );
}

export default MobileHeader;

