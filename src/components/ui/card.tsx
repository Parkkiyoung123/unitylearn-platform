import * as React from "react"
import { cn } from "@/lib/utils"

export type CardVariant = "default" | "bordered" | "elevated"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  header?: React.ReactNode
  footer?: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", header, footer, children, ...props }, ref) => {
    const variantClasses = {
      default: "rounded-lg border bg-card text-card-foreground shadow-sm",
      bordered: "rounded-lg border-2 border-border bg-card text-card-foreground",
      elevated: "rounded-lg bg-card text-card-foreground shadow-lg",
    }

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {header && (
          <div className="flex flex-col space-y-1.5 p-6">
            {header}
          </div>
        )}
        <div className={cn("p-6", header && "pt-0")}>
          {children}
        </div>
        {footer && (
          <div className="flex items-center p-6 pt-0">
            {footer}
          </div>
        )}
      </div>
    )
  }
)
Card.displayName = "Card"

/**
 * Card Header Component
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * Card Title Component
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * Card Description Component
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * Card Content Component
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * Card Footer Component
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
