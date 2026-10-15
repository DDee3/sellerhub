"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 shrink-0 rounded-full border border-border/50 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200 select-none shadow-soft"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      disabled={!mounted}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-200" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200" />
      )}
    </Button>
  );
}

export default ThemeToggle;
