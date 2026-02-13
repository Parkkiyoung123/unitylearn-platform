"use client";

import { cn } from "@/lib/utils";
import { Sprout, Leaf, TreeDeciduous, Mountain, Crown } from "lucide-react";

type Level = 1 | 2 | 3 | 4 | 5;

interface LevelBadgeProps {
  level: Level;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const levelConfig: Record<
  Level,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  1: {
    label: "Beginner",
    icon: Sprout,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
  },
  2: {
    label: "Easy",
    icon: Leaf,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    borderColor: "border-teal-200",
  },
  3: {
    label: "Normal",
    icon: TreeDeciduous,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
  },
  4: {
    label: "Hard",
    icon: Mountain,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200",
  },
  5: {
    label: "Expert",
    icon: Crown,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
  },
};

export function LevelBadge({
  level,
  size = "md",
  showIcon = true,
  className,
}: LevelBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1 h-5",
    md: "text-xs px-2.5 py-1 gap-1.5 h-6",
    lg: "text-sm px-3 py-1.5 gap-2 h-7",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-full font-semibold border",
        "shrink-0",
        // Mobile-optimized touch target (44px+ when used as button)
        size === "lg" && "min-w-[44px] min-h-[44px]",
        // Size variants
        sizeClasses[size],
        // Color system from config
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
      title={`난이도: ${config.label}`}
      aria-label={`난이도 ${level}: ${config.label}`}
    >
      {showIcon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
}
