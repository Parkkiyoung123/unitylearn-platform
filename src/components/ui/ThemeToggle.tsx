"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 opacity-50">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const currentIcon = resolvedTheme === "dark" ? (
    <Moon className="h-4 w-4" />
  ) : (
    <Sun className="h-4 w-4" />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 hover:bg-accent transition-colors"
          aria-label="테마 변경"
        >
          {currentIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>라이트 모드</span>
          {theme === "light" && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>다크 모드</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>시스템 설정</span>
          {theme === "system" && (
            <span className="ml-auto text-xs text-primary">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple toggle button that cycles through themes
export function ThemeToggleSimple() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="opacity-50">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const toggleTheme = () => {
    if (resolvedTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden"
      aria-label={resolvedTheme === "dark" ? "라이트 모드로 변경" : "다크 모드로 변경"}
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}
