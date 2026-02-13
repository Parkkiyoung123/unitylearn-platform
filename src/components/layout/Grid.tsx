import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | "auto";
  sm?: 1 | 2 | 3 | 4;
  md?: 1 | 2 | 3 | 4 | 5 | 6;
  lg?: 1 | 2 | 3 | 4 | 5 | 6;
  xl?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "none" | "xs" | "sm" | "default" | "md" | "lg" | "xl";
  rowGap?: "none" | "xs" | "sm" | "default" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

/**
 * Responsive Grid Component
 * 
 * Features:
 * - 1 column on mobile by default
 * - 2 columns on tablet (sm breakpoint)
 * - 3-4 columns on desktop (lg breakpoint)
 * - Auto-fit columns option
 * - Configurable gap utilities
 * - Touch-optimized spacing
 * 
 * @example
 * // Basic responsive grid
 * <Grid cols={1} sm={2} lg={3} gap="md">
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 * 
 * // Auto-fit grid
 * <Grid cols="auto" gap="lg" className="grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
 *   <Card />
 *   <Card />
 * </Grid>
 */
export function Grid({
  children,
  className,
  cols = 1,
  sm,
  md,
  lg,
  xl,
  gap = "default",
  rowGap,
  align = "stretch",
  justify = "start",
}: GridProps) {
  // Column classes mapping
  const colClasses: Record<number | string, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    auto: "grid-cols-1",
  };

  const smClasses: Record<number, string> = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
  };

  const mdClasses: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  };

  const lgClasses: Record<number, string> = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  };

  const xlClasses: Record<number, string> = {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
  };

  // Gap classes mapping
  const gapClasses: Record<string, string> = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-3",
    default: "gap-4",
    md: "gap-4 sm:gap-5 lg:gap-6",
    lg: "gap-6 sm:gap-8 lg:gap-10",
    xl: "gap-8 sm:gap-10 lg:gap-12",
  };

  // Row gap classes mapping
  const rowGapClasses: Record<string, string> = {
    none: "gap-y-0",
    xs: "gap-y-2",
    sm: "gap-y-3",
    default: "gap-y-4",
    md: "gap-y-4 sm:gap-y-5 lg:gap-y-6",
    lg: "gap-y-6 sm:gap-y-8 lg:gap-y-10",
    xl: "gap-y-8 sm:gap-y-10 lg:gap-y-12",
  };

  // Alignment classes
  const alignClasses: Record<string, string> = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  // Justification classes
  const justifyClasses: Record<string, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      className={cn(
        "grid",
        colClasses[cols],
        sm && smClasses[sm],
        md && mdClasses[md],
        lg && lgClasses[lg],
        xl && xlClasses[xl],
        gapClasses[gap],
        rowGap && rowGapClasses[rowGap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Auto-fit Grid Component
 * 
 * Automatically fits as many columns as possible based on minimum width
 * Perfect for card layouts that should wrap responsively
 */
interface AutoGridProps {
  children: ReactNode;
  className?: string;
  minWidth?: number; // Minimum width in pixels
  gap?: "none" | "xs" | "sm" | "default" | "md" | "lg" | "xl";
}

export function AutoGrid({
  children,
  className,
  minWidth = 280,
  gap = "default",
}: AutoGridProps) {
  const gapClasses: Record<string, string> = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-3",
    default: "gap-4",
    md: "gap-4 sm:gap-5 lg:gap-6",
    lg: "gap-6 sm:gap-8 lg:gap-10",
    xl: "gap-8 sm:gap-10 lg:gap-12",
  };

  return (
    <div
      className={cn("grid", gapClasses[gap], className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Grid Item Component
 * 
 * For fine-grained control over individual grid items
 */
interface GridItemProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | "full";
  smColSpan?: 1 | 2 | 3 | 4;
  mdColSpan?: 1 | 2 | 3 | 4;
  lgColSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
}

export function GridItem({
  children,
  className,
  colSpan,
  smColSpan,
  mdColSpan,
  lgColSpan,
  rowSpan,
}: GridItemProps) {
  const colSpanClasses: Record<number | string, string> = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
    full: "col-span-full",
  };

  const smColSpanClasses: Record<number, string> = {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-3",
    4: "sm:col-span-4",
  };

  const mdColSpanClasses: Record<number, string> = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
  };

  const lgColSpanClasses: Record<number, string> = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
  };

  const rowSpanClasses: Record<number, string> = {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
  };

  return (
    <div
      className={cn(
        colSpan && colSpanClasses[colSpan],
        smColSpan && smColSpanClasses[smColSpan],
        mdColSpan && mdColSpanClasses[mdColSpan],
        lgColSpan && lgColSpanClasses[lgColSpan],
        rowSpan && rowSpanClasses[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Flex Grid Component
 * 
 * A flexbox-based grid alternative for layouts that need different behavior
 */
interface FlexGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "none" | "xs" | "sm" | "default" | "md" | "lg" | "xl";
  wrap?: boolean;
}

export function FlexGrid({
  children,
  className,
  cols = 1,
  gap = "default",
  wrap = true,
}: FlexGridProps) {
  const gapClasses: Record<string, string> = {
    none: "gap-0",
    xs: "gap-2",
    sm: "gap-3",
    default: "gap-4",
    md: "gap-4 sm:gap-5 lg:gap-6",
    lg: "gap-6 sm:gap-8 lg:gap-10",
    xl: "gap-8 sm:gap-10 lg:gap-12",
  };

  // Calculate flex basis percentage based on columns
  const getFlexBasis = (columnCount: number) => {
    return `calc((100% - (${columnCount - 1} * var(--gap, 1rem))) / ${columnCount})`;
  };

  return (
    <div
      className={cn(
        "flex",
        wrap && "flex-wrap",
        gapClasses[gap],
        className
      )}
      style={{
        ["--gap" as string]: "1rem",
      }}
    >
      {children}
    </div>
  );
}
