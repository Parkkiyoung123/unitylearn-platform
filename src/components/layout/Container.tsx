import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  size?: "default" | "small" | "large" | "full";
}

const maxWidthClasses = {
  default: "max-w-7xl",
  small: "max-w-4xl",
  large: "max-w-screen-2xl",
  full: "max-w-full",
};

/**
 * Responsive Container Component
 * 
 * Features:
 * - Max-width breakpoints for different container sizes
 * - Responsive padding (px-4 sm:px-6 lg:px-8)
 * - Centered content with mx-auto
 * - Touch-optimized spacing
 * 
 * @example
 * <Container>
 *   <YourContent />
 * </Container>
 * 
 * <Container size="small" className="py-8">
 *   <YourContent />
 * </Container>
 */
export function Container({
  children,
  className,
  as: Component = "div",
  size = "default",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        // Center the container
        "mx-auto",
        // Max width based on size prop
        maxWidthClasses[size],
        // Responsive padding
        // Mobile: 16px (px-4), Tablet: 24px (sm:px-6), Desktop: 32px (lg:px-8)
        "px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * Responsive Section Component
 * 
 * A full-width section with responsive vertical padding
 */
interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: "none" | "small" | "default" | "large";
}

const spacingClasses = {
  none: "",
  small: "py-4 sm:py-6 lg:py-8",
  default: "py-8 sm:py-12 lg:py-16",
  large: "py-12 sm:py-16 lg:py-24",
};

export function Section({
  children,
  className,
  spacing = "default",
}: SectionProps) {
  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
}

/**
 * Responsive Content Wrapper
 * 
 * Wraps content with consistent responsive behavior
 */
interface ContentProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

export function Content({ children, className, narrow = false }: ContentProps) {
  return (
    <div
      className={cn(
        "mx-auto",
        narrow ? "max-w-3xl" : "max-w-none",
        className
      )}
    >
      {children}
    </div>
  );
}
