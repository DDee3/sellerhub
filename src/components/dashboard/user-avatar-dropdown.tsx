"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/components/providers/language-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface UserAvatarDropdownProps {
  shopName?: string;
  className?: string;
}

export function UserAvatarDropdown({ shopName, className }: UserAvatarDropdownProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message || t("error") || "Error logging out");
        return;
      }

      toast.success(t("logout"));
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Error logging out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        className={cn(
          "rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-transform active:scale-95 cursor-pointer inline-flex items-center justify-center",
          className
        )}
      >
        <Avatar className="h-9 w-9 bg-primary/10 text-primary border border-primary/20 hover:ring-2 hover:ring-primary/40 transition-all">
          <AvatarFallback className="text-xs font-semibold">
            {shopName ? shopName.slice(0, 2).toUpperCase() : "SH"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 p-1.5 rounded-2xl shadow-lift border border-border bg-popover/95 backdrop-blur-md"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2.5 py-1.5 font-normal">
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-semibold text-foreground truncate">
                {shopName || "SellerHub Shop"}
              </p>
              <p className="text-xs text-muted-foreground truncate">Reseller Store</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-1 border-border/60" />

          <DropdownMenuItem
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-muted text-foreground transition-colors"
          >
            <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{t("settings")}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 border-border/60" />

          <DropdownMenuItem
            variant="destructive"
            disabled={isLoading}
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <LogOut className="h-4 w-4 shrink-0 text-destructive" />
            )}
            <span>{t("logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserAvatarDropdown;

