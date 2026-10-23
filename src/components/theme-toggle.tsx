"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // hydration-safe mount check without setState-in-effect
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        resolvedTheme === "light" ? "Switch to dark theme" : "Switch to light theme"
      }
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      {mounted && resolvedTheme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}
