"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserAvatarDropdown } from "@/components/dashboard/user-avatar-dropdown";

export function MobileHeader({ shopName }: { shopName?: string }) {
  return (
    <header className="flex md:hidden h-14 items-center justify-between border-b border-border bg-background px-4 sticky top-0 z-40 select-none">
      {/* Brand on Left */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="font-semibold text-base tracking-tight text-foreground lowercase">
          exchange
        </span>
      </Link>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserAvatarDropdown shopName={shopName} />
      </div>
    </header>
  );
}

export default MobileHeader;
