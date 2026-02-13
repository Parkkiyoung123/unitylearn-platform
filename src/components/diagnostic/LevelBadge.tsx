"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuestionLevel, getLevelLabel } from "@/data/diagnostic-questions";
import { 
  Sprout, 
  Leaf, 
  TreeDeciduous,
  Star,
  Trophy,
  Target
} from "lucide-react";

interface LevelBadgeProps {
  level: QuestionLevel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "default" | "outline" | "result";
  className?: string;
}

const levelConfig: Record<QuestionLevel, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  beginner: {
    icon: Sprout,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200"
  },
  intermediate: {
    icon: Leaf,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  advanced: {
    icon: TreeDeciduous,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  }
};

export function LevelBadge({ 
  level, 
  size = "md", 
  showIcon = true,
  variant = "default",
  className 
}: LevelBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-2 gap-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  if (variant === "result") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold",
          config.bgColor,
          config.color,
          className
        )}
      >
        {showIcon && <Icon className={iconSizes[size]} />}
        <span>{getLevelLabel(level)}</span>
      </div>
    );
  }

  if (variant === "outline") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
          config.color,
          config.bgColor,
          config.borderColor,
          className
        )}
      >
        {showIcon && <Icon className="w-3.5 h-3.5" />}
        <span>{getLevelLabel(level)}</span>
      </div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center font-medium",
        sizeClasses[size],
        config.bgColor,
        config.color,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{getLevelLabel(level)}</span>
    </Badge>
  );
}

interface ScoreBadgeProps {
  score: number;
  maxScore: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreBadge({ 
  score, 
  maxScore, 
  size = "md",
  className 
}: ScoreBadgeProps) {
  const percentage = (score / maxScore) * 100;
  
  let icon = Target;
  let colorClass = "text-gray-600 bg-gray-50";
  
  if (percentage >= 80) {
    icon = Trophy;
    colorClass = "text-amber-600 bg-amber-50";
  } else if (percentage >= 50) {
    icon = Star;
    colorClass = "text-blue-600 bg-blue-50";
  }
  
  const Icon = icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-xl px-6 py-3 gap-3"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-7 h-7"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-semibold",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{score} / {maxScore}점</span>
    </div>
  );
}
