"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  labelFormat?: "fraction" | "percentage";
  color?: "primary" | "success" | "warning" | "danger";
}

export function ProgressBar({
  current,
  total,
  showLabel = true,
  size = "md",
  className,
  labelFormat = "fraction",
  color = "primary",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const isComplete = current >= total;

  const sizeClasses = {
    sm: {
      container: "h-1.5",
      label: "text-xs",
    },
    md: {
      container: "h-2.5",
      label: "text-sm",
    },
    lg: {
      container: "h-4",
      label: "text-base",
    },
  };

  const colorClasses = {
    primary: {
      fill: "bg-primary",
      background: "bg-primary/20",
      complete: "bg-green-500",
    },
    success: {
      fill: "bg-green-500",
      background: "bg-green-200",
      complete: "bg-green-600",
    },
    warning: {
      fill: "bg-amber-500",
      background: "bg-amber-200",
      complete: "bg-amber-600",
    },
    danger: {
      fill: "bg-red-500",
      background: "bg-red-200",
      complete: "bg-red-600",
    },
  };

  const colors = colorClasses[color];
  const sizes = sizeClasses[size];

  const formatLabel = () => {
    if (labelFormat === "percentage") {
      return `${Math.round(percentage)}%`;
    }
    return `${current} / ${total}`;
  };

  return (
    <div
      className={cn("w-full space-y-1.5", className)}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`진행률: ${Math.round(percentage)}%`}
    >
      {/* Label */}
      {showLabel && (
        <div className={cn("flex justify-between items-center", sizes.label)}>
          <span className="text-muted-foreground font-medium">
            {isComplete ? "완료" : "진행 중"}
          </span>
          <span
            className={cn(
              "font-semibold",
              isComplete ? "text-green-600" : "text-foreground"
            )}
          >
            {formatLabel()}
          </span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={cn(
          "relative w-full rounded-full overflow-hidden",
          sizes.container,
          colors.background
        )}
      >
        {/* Animated Fill */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            "min-w-[4px]",
            isComplete ? colors.complete : colors.fill
          )}
          style={{
            width: `${percentage}%`,
          }}
        >
          {/* Shine effect for visual polish */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            style={{
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Alternative compact version for inline use
interface CompactProgressBarProps {
  current: number;
  total: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CompactProgressBar({
  current,
  total,
  size = "sm",
  className,
}: CompactProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  const sizeClasses = {
    sm: "h-1.5 w-16",
    md: "h-2 w-24",
    lg: "h-2.5 w-32",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        className
      )}
    >
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-muted",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            percentage === 100 ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}
