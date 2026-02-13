"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LevelBadge } from "./LevelBadge";
import { CheckCircle2, Play, Lock, Clock, BookOpen } from "lucide-react";

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: string;
  isCompleted?: boolean;
  isLocked?: boolean;
  estimatedTime?: number;
  questionCount?: number;
  onClick?: () => void;
  className?: string;
}

export function QuizCard({
  id,
  title,
  description,
  difficulty,
  category,
  isCompleted = false,
  isLocked = false,
  estimatedTime,
  questionCount,
  onClick,
  className,
}: QuizCardProps) {
  return (
    <button
      onClick={!isLocked ? onClick : undefined}
      disabled={isLocked}
      className={cn(
        "w-full text-left group",
        isLocked && "cursor-not-allowed"
      )}
      aria-label={`${title} 퀴즈${isCompleted ? " (완료됨)" : ""}${isLocked ? " (잠김)" : ""}`}
    >
      <Card
        className={cn(
          // Base styles
          "p-5 transition-all duration-200 min-h-[140px] min-w-[280px]",
          "border-2",
          // Hover effects
          !isLocked && [
            "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5",
            "active:scale-[0.99] active:shadow-sm",
          ],
          // Locked state
          isLocked && [
            "opacity-60 bg-muted/50",
          ],
          // Completed state
          isCompleted && [
            "border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-900/10",
          ],
          className
        )}
      >
        <CardContent className="p-0 space-y-3">
          {/* Header: Category & Difficulty */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                  "bg-primary/10 text-primary"
                )}
              >
                <BookOpen className="w-3 h-3" />
                {category}
              </span>

              {/* Difficulty Badge */}
              <LevelBadge level={difficulty} size="sm" />
            </div>

            {/* Status Icon */}
            {isCompleted && (
              <CheckCircle2
                className="w-5 h-5 text-green-500 shrink-0"
                aria-label="완료됨"
              />
            )}
            {isLocked && (
              <Lock
                className="w-5 h-5 text-muted-foreground shrink-0"
                aria-label="잠김"
              />
            )}
            {!isCompleted && !isLocked && (
              <Play
                className="w-5 h-5 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-1 text-foreground">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>

          {/* Footer: Meta Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            {estimatedTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {estimatedTime}분
              </span>
            )}
            {questionCount && (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {questionCount}문제
              </span>
            )}
            {isCompleted && (
              <span className="text-green-600 dark:text-green-400 font-medium ml-auto">
                완료
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
