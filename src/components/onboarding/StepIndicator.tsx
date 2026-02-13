"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  steps,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Progress bar background */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step circles */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2",
                    isCompleted &&
                      "bg-gradient-to-r from-blue-500 to-purple-500 border-transparent text-white",
                    isCurrent &&
                      "bg-white border-blue-500 text-blue-600 shadow-lg shadow-blue-200 scale-110",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors duration-300",
                    isCurrent ? "text-blue-600" : "text-gray-500",
                    isCompleted && "text-gray-600"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile
export function StepIndicatorCompact({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-400">
          {Math.round(progress)}% 완료
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
