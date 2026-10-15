"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isExpanded?: boolean;
}

export function LogoutButton({
  className,
  variant = "ghost",
  isExpanded = true,
}: LogoutButtonProps) {
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
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoading}
      aria-label={t("logout")}
      className={cn(
        "text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200",
        isExpanded ? "w-full justify-start px-3 gap-2" : "justify-center px-0 w-9 h-9",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : (
        <LogOut className="h-4 w-4 shrink-0" />
      )}
      {isExpanded && <span className="truncate">{t("logout")}</span>}
    </Button>
  );
}

export default LogoutButton;
