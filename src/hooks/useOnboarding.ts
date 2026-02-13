"use client";

import { useState, useEffect, useCallback } from "react";
import type { SkillLevel } from "@/components/onboarding/LevelStep";
import type { InterestCategory } from "@/components/onboarding/InterestStep";

const ONBOARDING_STORAGE_KEY = "unitylearn_onboarding";
const ONBOARDING_COMPLETED_KEY = "unitylearn_onboarding_completed";

export interface OnboardingData {
  nickname: string;
  level: SkillLevel;
  interests: InterestCategory[];
  completed: boolean;
  completedAt?: string;
}

interface UseOnboardingReturn {
  data: OnboardingData;
  isLoading: boolean;
  isCompleted: boolean;
  updateNickname: (nickname: string) => void;
  updateLevel: (level: SkillLevel) => void;
  updateInterests: (interests: InterestCategory[]) => void;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  generateDefaultNickname: (email?: string) => string;
}

const defaultData: OnboardingData = {
  nickname: "",
  level: "beginner",
  interests: [],
  completed: false,
};

export function useOnboarding(): UseOnboardingReturn {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load onboarding data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);

        if (savedData) {
          const parsed = JSON.parse(savedData);
          setData((prev) => ({ ...prev, ...parsed }));
        }

        if (completed === "true") {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error("Failed to load onboarding data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save onboarding data:", error);
      }
    }
  }, [data, isLoading]);

  const updateNickname = useCallback((nickname: string) => {
    setData((prev) => ({ ...prev, nickname }));
  }, []);

  const updateLevel = useCallback((level: SkillLevel) => {
    setData((prev) => ({ ...prev, level }));
  }, []);

  const updateInterests = useCallback((interests: InterestCategory[]) => {
    setData((prev) => ({ ...prev, interests }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    const completedData = {
      ...data,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(completedData));
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");

    // TODO: Send data to server
    // await fetch('/api/user/onboarding', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(completedData),
    // });

    setData(completedData);
    setIsCompleted(true);
  }, [data]);

  const skipOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setIsCompleted(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    setData(defaultData);
    setIsCompleted(false);
  }, []);

  const generateDefaultNickname = useCallback((email?: string): string => {
    if (email) {
      const localPart = email.split("@")[0];
      // Remove special characters and limit length
      const cleaned = localPart.replace(/[^a-zA-Z0-9가-힣]/g, "");
      if (cleaned.length >= 2 && cleaned.length <= 20) {
        return cleaned;
      }
    }

    // Fallback to UnityLearner + random number
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `UnityLearner${randomNum}`;
  }, []);

  return {
    data,
    isLoading,
    isCompleted,
    updateNickname,
    updateLevel,
    updateInterests,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    generateDefaultNickname,
  };
}

// Helper to check if onboarding is completed (for use in other components)
export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
}

// Helper to get recommended level from diagnostic result
export function getRecommendedLevelFromDiagnostic(
  score: number
): SkillLevel {
  if (score <= 3) return "beginner";
  if (score <= 6) return "intermediate";
  return "advanced";
}
