"use client";

import { useState } from "react";
import { Sparkles, Zap, Rocket, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

interface LevelStepProps {
  recommendedLevel?: SkillLevel | null;
  onNext: (level: SkillLevel) => void;
  onBack?: () => void;
}

const levels = [
  {
    id: "beginner" as SkillLevel,
    icon: Sparkles,
    title: "초보자",
    description: "Unity를 처음 시작했어요",
    detail: "기본 개념부터 차근차근 배우고 싶어요",
    color: "from-green-400 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
  },
  {
    id: "intermediate" as SkillLevel,
    icon: Zap,
    title: "중급자",
    description: "기본은 알지만 버그 해결이 어려워요",
    detail: "실전에서 마주치는 문제들을 해결하고 싶어요",
    color: "from-blue-400 to-indigo-500",
    bgColor: "from-blue-50 to-indigo-50",
  },
  {
    id: "advanced" as SkillLevel,
    icon: Rocket,
    title: "고급자",
    description: "다양한 버그를 경험하고 싶어요",
    detail: "심화 개념과 최적화 기법을 익히고 싶어요",
    color: "from-purple-400 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
  },
];

export function LevelStep({ recommendedLevel, onNext, onBack }: LevelStepProps) {
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel | null>(
    recommendedLevel || null
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-4">
          <Crown className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          현재 수준을 알려주세요
        </h2>
        <p className="text-gray-600">
          당신의 Unity 경험 수준에 맞는 콘텐츠를 추천해드립니다.
        </p>
      </div>

      {/* Recommended badge */}
      {recommendedLevel && (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Sparkles className="w-4 h-4 mr-1" />
            진단 테스트 결과 기반 추천
          </span>
        </div>
      )}

      <div className="space-y-3">
        {levels.map((level) => {
          const Icon = level.icon;
          const isSelected = selectedLevel === level.id;
          const isRecommended = recommendedLevel === level.id;

          return (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all duration-300",
                "hover:shadow-md hover:scale-[1.02]",
                isSelected
                  ? `border-transparent bg-gradient-to-r ${level.bgColor} shadow-lg`
                  : "border-gray-200 bg-white hover:border-gray-300",
                isRecommended && !isSelected && "ring-2 ring-blue-200"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br",
                    level.color
                  )}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={cn(
                        "font-semibold text-lg",
                        isSelected ? "text-gray-900" : "text-gray-700"
                      )}
                    >
                      {level.title}
                    </h3>
                    {isRecommended && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        추천
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-0.5">
                    {level.description}
                  </p>
                  <p className="text-xs text-gray-500">{level.detail}</p>
                </div>

                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12"
          >
            이전
          </Button>
        )}
        <Button
          onClick={() => selectedLevel && onNext(selectedLevel)}
          disabled={!selectedLevel}
          className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
