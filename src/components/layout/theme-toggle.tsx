"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/**
 * Theme toggle — cycles light ↔ dark.
 *
 * Uses the canonical CSS-only icon-swap pattern: both Sun and Moon icons are
 * always in the DOM; visibility is controlled purely by the `.dark` class
 * via Tailwind's `dark:` variants. No `useState`, no `useEffect`, no
 * `mounted` gate — so hydration timing can never leave the toggle invisible.
 *
 * next-themes' inline script adds `.dark` (or not) to `<html>` before the
 * browser paints, so the correct icon is shown from the very first frame
 * with zero flash.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="relative"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}
