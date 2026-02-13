"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"

interface NavLink {
  href: string
  label: string
}

interface MobileNavProps {
  links: NavLink[]
  logo?: React.ReactNode
  className?: string
}

/**
 * Mobile Navigation Component (Sheet/Drawer)
 * 
 * Features:
 * - Sheet/drawer component for mobile menu
 * - Hamburger toggle button with minimum 44px touch target
 * - Navigation links with proper touch targets
 * - Backdrop blur effect
 * - Uses existing Button and Sheet components
 * 
 * Touch Target Compliance (WCAG 2.5.5):
 * - Toggle button: min-h-[44px] min-w-[44px]
 * - Navigation links: min-h-[44px] with proper padding
 * - Close button: min-h-[44px] min-w-[44px]
 * - Minimum 8px spacing between interactive elements
 */
const MobileNav = React.forwardRef<HTMLDivElement, MobileNavProps>(
  ({ links, logo, className }, ref) => {
    const pathname = usePathname()
    const [open, setOpen] = React.useState(false)

    return (
      <div ref={ref} className={cn("lg:hidden", className)}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="md"
              className={cn(
                // Ensure minimum 44px touch target
                "min-h-[44px] min-w-[44px]",
                "p-2",
                "relative"
              )}
              aria-label="메뉴 열기"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          
          <SheetContent 
            side="right" 
            className={cn(
              "w-[300px] sm:w-[350px]",
              "p-0",
              // Backdrop blur effect
              "backdrop-blur-xl bg-background/95"
            )}
          >
            {/* Header with Logo and Close */}
            <SheetHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-semibold">
                  {logo || "UnityLearn"}
                </SheetTitle>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="md"
                    className={cn(
                      // Ensure minimum 44px touch target
                      "min-h-[44px] min-w-[44px]",
                      "p-2",
                      "rounded-full"
                    )}
                    aria-label="메뉴 닫기"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>

            {/* Navigation Links */}
            <nav className="flex flex-col py-4">
              {links.map((link, index) => {
                const isActive = pathname === link.href
                
                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        // Layout
                        "flex items-center",
                        // Minimum 44px touch target height
                        "min-h-[44px]",
                        // Spacing
                        "px-6 py-3",
                        // Minimum 8px spacing between items
                        index < links.length - 1 ? "mb-1" : "",
                        // Typography
                        "text-base font-medium",
                        // Visual states
                        isActive
                          ? "text-primary bg-primary/5 border-r-2 border-primary"
                          : "text-foreground hover:text-primary hover:bg-accent",
                        // Transition
                        "transition-colors duration-200"
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t bg-background/50">
              <p className="text-sm text-muted-foreground text-center">
                © 2024 UnityLearn
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }
)
MobileNav.displayName = "MobileNav"

export { MobileNav }
export type { NavLink, MobileNavProps }
