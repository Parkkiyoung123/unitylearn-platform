"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator, StepIndicatorCompact } from "@/components/onboarding/StepIndicator";
import { ProfileStep } from "@/components/onboarding/ProfileStep";
import { LevelStep, type SkillLevel } from "@/components/onboarding/LevelStep";
import { InterestStep, type InterestCategory } from "@/components/onboarding/InterestStep";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { useOnboarding, getRecommendedLevelFromDiagnostic } from "@/hooks/useOnboarding";
import { useIsMobile } from "@/hooks/use-mobile";

const steps = [
  { id: 1, label: "프로필" },
  { id: 2, label: "수준" },
  { id: 3, label: "관심사" },
  { id: 4, label: "완료" },
];

function LoadingUI() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const {
    data,
    isLoading,
    isCompleted,
    updateNickname,
    updateLevel,
    updateInterests,
    completeOnboarding,
    skipOnboarding,
    generateDefaultNickname,
  } = useOnboarding();

  const [currentStep, setCurrentStep] = useState(1);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);

  // Check if already completed or get diagnostic score
  useEffect(() => {
    if (!isLoading) {
      // Redirect if already completed
      if (isCompleted) {
        router.push("/dashboard");
        return;
      }

      // Check for diagnostic result in URL
      const score = searchParams.get("diagnostic_score");
      if (score) {
        const parsedScore = parseInt(score, 10);
        if (!isNaN(parsedScore)) {
          setDiagnosticScore(parsedScore);
        }
      }
    }
  }, [isLoading, isCompleted, router, searchParams]);

  // Generate default nickname if empty
  useEffect(() => {
    if (!isLoading && !data.nickname) {
      // In real app, get email from auth context
      const defaultNickname = generateDefaultNickname();
      updateNickname(defaultNickname);
    }
  }, [isLoading, data.nickname, generateDefaultNickname, updateNickname]);

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleProfileNext = (nickname: string) => {
    updateNickname(nickname);
    handleNextStep();
  };

  const handleLevelNext = (level: SkillLevel) => {
    updateLevel(level);
    handleNextStep();
  };

  const handleInterestNext = (interests: InterestCategory[]) => {
    updateInterests(interests);
    handleNextStep();
  };

  const handleComplete = async () => {
    await completeOnboarding();
    router.push("/dashboard");
  };

  const handleSkip = () => {
    skipOnboarding();
    router.push("/dashboard");
  };

  const getRecommendedLevel = (): SkillLevel | null => {
    if (diagnosticScore !== null) {
      return getRecommendedLevelFromDiagnostic(diagnosticScore);
    }
    return null;
  };

  if (isLoading) {
    return <LoadingUI />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            UnityLearn
          </h1>
          <p className="text-gray-600">
            몇 가지 정보를 알려주시면 맞춤 학습을 시작합니다
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          {isMobile ? (
            <StepIndicatorCompact
              currentStep={currentStep}
              totalSteps={steps.length}
            />
          ) : (
            <StepIndicator
              currentStep={currentStep}
              totalSteps={steps.length}
              steps={steps}
            />
          )}
        </div>

        {/* Content Card */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <ProfileStep
                    defaultNickname={data.nickname}
                    onNext={handleProfileNext}
                    onSkip={handleSkip}
                  />
                )}

                {currentStep === 2 && (
                  <LevelStep
                    recommendedLevel={getRecommendedLevel()}
                    onNext={handleLevelNext}
                    onBack={handlePrevStep}
                  />
                )}

                {currentStep === 3 && (
                  <InterestStep
                    onNext={handleInterestNext}
                    onBack={handlePrevStep}
                  />
                )}

                {currentStep === 4 && (
                  <WelcomeStep
                    nickname={data.nickname}
                    level={data.level}
                    interests={data.interests}
                    onComplete={handleComplete}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Skip option for early steps */}
        {currentStep < 3 && (
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              나중에 설정하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <OnboardingContent />
    </Suspense>
  );
}
