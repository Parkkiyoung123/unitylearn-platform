"use client";

/**
 * Navbar Component
 * 
 * SessionProvider와 연동된 네비게이션 바.
 * useSession 훅을 통해 사용자 인증 상태를 실시간으로 반영합니다.
 */

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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";

const navLinks = [
  {
    href: "/diagnostic",
    label: "진단 테스트",
    icon: Brain,
    requireAuth: false,
  },
  {
    href: "/quiz",
    label: "퀴즈",
    icon: ClipboardList,
    requireAuth: false, // 게스트도 접근 가능
  },
  {
    href: "/dashboard",
    label: "대시보드",
    icon: LayoutDashboard,
    requireAuth: true,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // SessionProvider에서 세션 상태 가져오기
  const { user, isLoading, isAuthenticated, signOut } = useSession();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Filter links based on auth status
  const visibleLinks = navLinks.filter((link) => {
    if (!link.requireAuth) return true;
    return isAuthenticated;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // 로딩 중일 때 스켈레톤 UI
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-foreground hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:inline">UnityLearn</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
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
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
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

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Desktop User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user?.image || undefined}
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {user?.name
                            ? getInitials(user.name)
                            : user?.email?.[0].toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        프로필
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        설정
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">로그인</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/auth/signup">시작하기</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="메뉴 열기"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    UnityLearn
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 mt-8">
                  {/* Mobile Navigation Links */}
                  <nav className="flex flex-col gap-2">
                    {visibleLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <SheetClose asChild key={link.href}>
                          <Link
                            href={link.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                              isActive(link.href)
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            {link.label}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </nav>

                  <hr className="border-border" />

                  {isAuthenticated ? (
                    <>
                      {/* Mobile User Info */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user?.image || undefined}
                            alt={user?.name || "User"}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user?.name
                              ? getInitials(user.name)
                              : user?.email?.[0].toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user?.name || "User"}</span>
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {user?.email}
                          </span>
                        </div>
                      </div>

                      {/* Mobile User Actions */}
                      <div className="flex flex-col gap-2">
                        <SheetClose asChild>
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                          >
                            <User className="w-5 h-5" />
                            프로필
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                          >
                            <Settings className="w-5 h-5" />
                            설정
                          </Link>
                        </SheetClose>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleSignOut();
                          }}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-5 h-5" />
                          로그아웃
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <SheetClose asChild>
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/auth/signin">로그인</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Link href="/auth/signup">시작하기</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
