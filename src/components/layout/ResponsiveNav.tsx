"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  ClipboardList,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Menu,
  GraduationCap,
  Home,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
}

interface ResponsiveNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  onSignOut?: () => void;
  links?: NavLink[];
  variant?: "top" | "bottom";
  className?: string;
}

const defaultLinks: NavLink[] = [
  {
    href: "/",
    label: "홈",
    icon: Home,
    requireAuth: false,
  },
  {
    href: "/diagnostic",
    label: "진단",
    icon: Brain,
    requireAuth: false,
  },
  {
    href: "/quiz",
    label: "퀴즈",
    icon: ClipboardList,
    requireAuth: true,
  },
  {
    href: "/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
    requireAuth: true,
  },
];

/**
 * Responsive Navigation Component
 * 
 * Features:
 * - Hamburger menu on mobile (top variant)
 * - Bottom navigation bar on mobile (bottom variant)
 * - Smooth transitions and animations
 * - Touch-optimized targets (min 44px)
 * - Accessible with proper ARIA labels
 * 
 * @example
 * // Top navigation with hamburger menu
 * <ResponsiveNav user={user} onSignOut={handleSignOut} variant="top" />
 * 
 * // Bottom navigation bar
 * <ResponsiveNav user={user} onSignOut={handleSignOut} variant="bottom" />
 */
export function ResponsiveNav({
  user,
  onSignOut,
  links = defaultLinks,
  variant = "top",
  className,
}: ResponsiveNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Filter links based on auth status
  const visibleLinks = links.filter((link) => {
    if (!link.requireAuth) return true;
    return !!user;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mobile Menu Overlay (for top variant)
  const MobileMenuOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background transition-transform duration-300 ease-in-out md:hidden",
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          UnityLearn
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(false)}
          className="h-11 w-11 touch-target"
          aria-label="메뉴 닫기"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col p-4 gap-2">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium transition-colors touch-target-min",
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {user.name
                  ? getInitials(user.name)
                  : user.email?.[0].toUpperCase() || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">
                  {user.name || "User"}
                </span>
                <span className="text-sm text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
            </div>
            <Link
              href="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors touch-target-min"
            >
              <User className="w-5 h-5" />
              프로필
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors touch-target-min"
            >
              <Settings className="w-5 h-5" />
              설정
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onSignOut?.();
              }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors touch-target-min text-left w-full"
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              asChild
              className="w-full h-12 touch-target"
            >
              <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                로그인
              </Link>
            </Button>
            <Button
              asChild
              className="w-full h-12 touch-target bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                시작하기
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Top Navigation with Hamburger
  const TopNav = () => (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-foreground hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline">UnityLearn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors touch-target-min",
                    isActive(link.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {user.name || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSignOut}
                  className="h-10 w-10 touch-target"
                  aria-label="로그아웃"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="h-10 touch-target">
                  <Link href="/auth/signin">로그인</Link>
                </Button>
                <Button
                  asChild
                  className="h-10 touch-target bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/auth/signup">시작하기</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden h-11 w-11 touch-target"
            aria-label="메뉴 열기"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && <MobileMenuOverlay />}
    </header>
  );

  // Bottom Navigation Bar (Mobile Only)
  const BottomNav = () => {
    if (!isMobile) {
      return (
        <header
          className={cn(
            "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            className
          )}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-xl"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                UnityLearn
              </Link>
              <div className="flex items-center gap-2">
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSignOut}
                    className="h-10 touch-target"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </Button>
                ) : (
                  <Button asChild className="h-10 touch-target">
                    <Link href="/auth/signin">로그인</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
      );
    }

    return (
      <>
        {/* Top Header for Mobile with Bottom Nav */}
        <header
          className={cn(
            "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            className
          )}
        >
          <div className="flex items-center justify-between px-4 h-14">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              UnityLearn
            </Link>
            {user && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {user.name
                  ? getInitials(user.name)
                  : user.email?.[0].toUpperCase() || "U"}
              </div>
            )}
          </div>
        </header>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-pb">
          <div className="flex items-center justify-around h-16">
            {visibleLinks.slice(0, 5).map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 h-16 gap-0.5 transition-colors touch-target",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-6 h-6", active && "scale-110 transition-transform")} />
                  <span className="text-[10px] font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom padding for content to account for bottom nav */}
        <div className="h-16" />
      </>
    );
  };

  return variant === "top" ? <TopNav /> : <BottomNav />;
}

/**
 * Mobile Bottom Navigation Only
 * 
 * Use this when you want only the bottom navigation without the top header
 */
export function MobileBottomNav({
  links = defaultLinks,
  className,
}: {
  links?: NavLink[];
  className?: string;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (!isMobile) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-pb",
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {links.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-16 gap-0.5 transition-colors touch-target",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  active && "scale-110 transition-transform"
                )}
              />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
