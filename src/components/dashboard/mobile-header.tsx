"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserAvatarDropdown } from "@/components/dashboard/user-avatar-dropdown";

export function MobileHeader({ shopName }: { shopName?: string }) {
  return (
    <header className="flex md:hidden h-14 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sticky top-0 z-40 select-none">
      {/* Brand / Logo on Left */}
      <Link href="/dashboard" className="flex items-center gap-2.5 group">
        <Image
          src="/logo.png"
          alt="SellerHub"
          width={32}
          height={32}
          className="rounded-xl object-contain shrink-0"
          priority
        />
        <span className="font-bold text-base tracking-tight text-foreground">
          SellerHub
        </span>
      </Link>

      {/* Right controls: Theme toggle + User Avatar Dropdown */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-0.5 rounded-full bg-muted/50 border border-border/50">
          <ThemeToggle />
        </div>
        <UserAvatarDropdown shopName={shopName} />
      </div>
    </header>
  );
}

export default MobileHeader;
