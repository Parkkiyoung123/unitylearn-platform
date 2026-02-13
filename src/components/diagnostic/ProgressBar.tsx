"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  stage?: 1 | 2;
}

export function ProgressBar({ current, total, stage = 1 }: ProgressBarProps) {
  const progress = ((current - 1) / total) * 100;
  const stageProgress = stage === 2 ? 50 : 0;
  const totalProgress = progress + (stageProgress / total);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          문제 {current} / {total}
        </span>
        <span>
          {stage === 1 ? "원인 분석" : "해결 방법"}
        </span>
      </div>
      
      {/* Main progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Background for completed questions */}
        <div
          className="absolute h-full bg-primary/30 transition-all duration-500 ease-out"
          style={{ width: `${((current - 1) / total) * 100}%` }}
        />
        
        {/* Current question progress */}
        <div
          className={cn(
            "absolute h-full transition-all duration-500 ease-out",
            stage === 1 ? "bg-primary/60" : "bg-primary"
          )}
          style={{
            left: `${((current - 1) / total) * 100}%`,
            width: `${(1 / total) * (stage === 2 ? 100 : 50)}%`
          }}
        />

        {/* Stage indicator dots */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: total }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex-1 border-r border-background last:border-r-0",
                index < current - 1 && "bg-primary/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-between px-1">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index < current - 1
                ? "bg-primary"
                : index === current - 1
                ? stage === 2
                  ? "bg-primary scale-125"
                  : "bg-primary/60 scale-110"
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}
