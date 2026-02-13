"use client";

import { useState } from "react";
import {
  Box,
  Palette,
  Layout,
  Play,
  Volume2,
  Code,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type InterestCategory =
  | "physics"
  | "rendering"
  | "ui"
  | "animation"
  | "audio"
  | "scripting";

interface InterestStepProps {
  onNext: (interests: InterestCategory[]) => void;
  onBack?: () => void;
}

const categories = [
  {
    id: "physics" as InterestCategory,
    icon: Box,
    title: "Physics",
    description: "물리 엔진, 충돌 감지, Rigidbody",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "rendering" as InterestCategory,
    icon: Palette,
    title: "Rendering",
    description: "그래픽, 셰이더, 라이팅",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "ui" as InterestCategory,
    icon: Layout,
    title: "UI",
    description: "Canvas, Button, Event System",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "animation" as InterestCategory,
    icon: Play,
    title: "Animation",
    description: "Animator, Timeline, Blend Tree",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "audio" as InterestCategory,
    icon: Volume2,
    title: "Audio",
    description: "AudioSource, Mixer, Spatial Audio",
    color: "from-red-500 to-rose-500",
  },
  {
    id: "scripting" as InterestCategory,
    icon: Code,
    title: "Scripting",
    description: "C#, Unity API, 디자인 패턴",
    color: "from-indigo-500 to-violet-500",
  },
];

export function InterestStep({ onNext, onBack }: InterestStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<
    InterestCategory[]
  >([]);

  const toggleInterest = (id: InterestCategory) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    onNext(selectedInterests);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 mb-4">
          <Heart className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          관심 있는 분야를 선택해주세요
        </h2>
        <p className="text-gray-600">
          관심사에 맞는 퀴즈와 학습 콘텐츠를 추천해드립니다.
        </p>
        <p className="text-sm text-gray-400">
          *언제든지 프로필에서 변경할 수 있어요
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedInterests.includes(category.id);

          return (
            <label
              key={category.id}
              className={cn(
                "relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                "hover:shadow-md",
                isSelected
                  ? "border-transparent bg-gray-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleInterest(category.id)}
                className="sr-only"
              />

              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3",
                  "bg-gradient-to-br",
                  category.color,
                  isSelected && "ring-2 ring-offset-2 ring-gray-300"
                )}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{category.title}</h3>
                <p className="text-xs text-gray-500 truncate">
                  {category.description}
                </p>
              </div>

              <div
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300"
                )}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          {selectedInterests.length > 0
            ? `${selectedInterests.length}개 선택됨`
            : "선택사항 - 건 바뛰어도 괜찮아요"}
        </p>
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
          onClick={handleNext}
          className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group"
        >
          {selectedInterests.length > 0 ? (
            <>
              완료
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            "걸 뛰기"
          )}
        </Button>
      </div>
    </div>
  );
}
