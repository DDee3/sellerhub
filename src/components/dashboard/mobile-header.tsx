"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserAvatarDropdown } from "@/components/dashboard/user-avatar-dropdown";

export function MobileHeader({ shopName }: { shopName?: string }) {
  return (
    <header className="flex md:hidden h-12 items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-4 sticky top-0 z-40 select-none">
      {/* Brand on Left */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
        <span className="font-light text-base tracking-[-0.64px] text-foreground lowercase">
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
