"use client";

import { useEffect, useState } from "react";
import { PartyPopper, Target, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WelcomeStepProps {
  nickname: string;
  level: string;
  interests: string[];
  onComplete: () => void;
}

const levelLabels: Record<string, string> = {
  beginner: "초보자",
  intermediate: "중급자",
  advanced: "고급자",
};

const interestLabels: Record<string, string> = {
  physics: "Physics",
  rendering: "Rendering",
  ui: "UI",
  animation: "Animation",
  audio: "Audio",
  scripting: "Scripting",
};

const interestColors: Record<string, string> = {
  physics: "bg-blue-100 text-blue-800",
  rendering: "bg-purple-100 text-purple-800",
  ui: "bg-green-100 text-green-800",
  animation: "bg-orange-100 text-orange-800",
  audio: "bg-red-100 text-red-800",
  scripting: "bg-indigo-100 text-indigo-800",
};

export function WelcomeStep({
  nickname,
  level,
  interests,
  onComplete,
}: WelcomeStepProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti effect
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getRecommendedPath = () => {
    switch (level) {
      case "beginner":
        return {
          title: "Unity 기초 퀴즈",
          description: "Unity의 기본 개념과 작동 원리를 배워보세요",
          action: "기초 퀴즈 시작하기",
        };
      case "intermediate":
        return {
          title: "버그 진단 테스트",
          description: "실전 버그 시나리오를 분석하고 해결책을 찾아보세요",
          action: "진단 테스트 시작",
        };
      case "advanced":
        return {
          title: "고급 문제 해결",
          description: "복잡한 버그 패턴과 최적화 기법을 마스터하세요",
          action: "고급 퀴즈 도전",
        };
      default:
        return {
          title: "Unity 기초 퀴즈",
          description: "Unity의 기본 개념과 작동 원리를 배워보세요",
          action: "학습 시작하기",
        };
    }
  };

  const recommendedPath = getRecommendedPath();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 mb-4 animate-bounce">
            <PartyPopper className="w-10 h-10 text-yellow-600" />
          </div>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Simple confetti effect */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"][i],
                    left: `${50 + (Math.random() - 0.5) * 100}%`,
                    top: "50%",
                  }}
                  animate={{
                    y: [0, -100 - Math.random() * 100],
                    x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-900">
          환영합니다, {nickname}님! 🎉
        </h2>
        <p className="text-gray-600 text-lg">
          UnityLearn의 여정을 시작할 준비가 되었습니다.
        </p>
      </div>

      {/* Profile Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          내 프로필
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-20">닉네임</span>
            <span className="font-medium text-gray-900">{nickname}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-20">수준</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {levelLabels[level] || level}
            </span>
          </div>

          {interests.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-sm text-gray-500 w-20 pt-1">관심사</span>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      interestColors[interest] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {interestLabels[interest] || interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Path */}
      <div className="border-2 border-blue-100 rounded-2xl p-6 bg-blue-50/50">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">추천 시작점</h3>
        </div>

        <h4 className="text-lg font-semibold text-blue-900 mb-1">
          {recommendedPath.title}
        </h4>
        <p className="text-sm text-blue-700 mb-4">{recommendedPath.description}</p>

        <Button
          onClick={onComplete}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group"
        >
          {recommendedPath.action}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        언제든지 프로필에서 설정을 변경할 수 있습니다.
      </p>
    </div>
  );
}
