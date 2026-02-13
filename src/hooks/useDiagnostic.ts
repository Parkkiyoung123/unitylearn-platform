"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  diagnosticQuestions,
  DiagnosticQuestion,
  DiagnosticResult,
  calculateResult
} from "@/data/diagnostic-questions";

const STORAGE_KEY = "unitylearn_diagnostic_progress";

interface Answer {
  stage1: number;
  stage2: number;
}

interface ProgressState {
  currentQuestionIndex: number;
  currentStage: 1 | 2;
  answers: Record<number, Answer>;
  startTime: number;
  questionTimes: Record<number, { stage1: number; stage2: number }>;
}

interface UseDiagnosticReturn {
  // 현재 상태
  currentQuestion: DiagnosticQuestion;
  currentQuestionIndex: number;
  currentStage: 1 | 2;
  totalQuestions: number;
  
  // 답변 관련
  answers: Map<number, Answer>;
  currentStage1Answer?: number;
  currentStage2Answer?: number;
  
  // 진행 상태
  isComplete: boolean;
  isLoading: boolean;
  
  // 액션
  selectAnswer: (stage: 1 | 2, answerIndex: number) => void;
  goToNextStage: () => void;
  goToNextQuestion: () => void;
  resetTest: () => void;
  submitTest: () => DiagnosticResult;
  
  // 유틸리티
  hasAnsweredCurrentStage: boolean;
  isCurrentStageCorrect: boolean;
  getElapsedTime: () => number;
}

function loadProgressFromStorage(): ProgressState | null {
  if (typeof window === "undefined") return null;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved) as ProgressState;
    
    // 24시간이 지난 데이터는 무효화
    const now = Date.now();
    if (now - parsed.startTime > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

function saveProgressToStorage(state: ProgressState) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save diagnostic progress:", error);
  }
}

function clearProgressFromStorage() {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear diagnostic progress:", error);
  }
}

export function useDiagnostic(): UseDiagnosticReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState<1 | 2>(1);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionTimes, setQuestionTimes] = useState<
    Map<number, { stage1: number; stage2: number }>
  >(new Map());
  const [isComplete, setIsComplete] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const saved = loadProgressFromStorage();
    if (saved) {
      setCurrentQuestionIndex(saved.currentQuestionIndex);
      setCurrentStage(saved.currentStage);
      setAnswers(new Map(Object.entries(saved.answers).map(([k, v]) => [Number(k), v])));
      setStartTime(saved.startTime);
      setQuestionTimes(
        new Map(Object.entries(saved.questionTimes).map(([k, v]) => [Number(k), v]))
      );
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoading) return;
    
    const state: ProgressState = {
      currentQuestionIndex,
      currentStage,
      answers: Object.fromEntries(answers),
      startTime,
      questionTimes: Object.fromEntries(questionTimes)
    };
    saveProgressToStorage(state);
  }, [currentQuestionIndex, currentStage, answers, startTime, questionTimes, isLoading]);

  const currentQuestion = diagnosticQuestions[currentQuestionIndex];
  const totalQuestions = diagnosticQuestions.length;

  const currentStage1Answer = answers.get(currentQuestion?.id)?.stage1;
  const currentStage2Answer = answers.get(currentQuestion?.id)?.stage2;

  const hasAnsweredCurrentStage = currentStage === 1 
    ? currentStage1Answer !== undefined && currentStage1Answer >= 0
    : currentStage2Answer !== undefined && currentStage2Answer >= 0;

  const isCurrentStageCorrect = useCallback(() => {
    if (!hasAnsweredCurrentStage) return false;
    
    const answer = answers.get(currentQuestion.id);
    if (!answer) return false;
    
    const stageData = currentStage === 1 
      ? currentQuestion.stage1 
      : currentQuestion.stage2;
    
    const selectedAnswer = currentStage === 1 
      ? answer.stage1 
      : answer.stage2;
    
    return selectedAnswer === stageData.correct;
  }, [answers, currentQuestion, currentStage, hasAnsweredCurrentStage]);

  const selectAnswer = useCallback((stage: 1 | 2, answerIndex: number) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      const existing = newAnswers.get(currentQuestion.id) || { stage1: -1, stage2: -1 };
      
      if (stage === 1) {
        newAnswers.set(currentQuestion.id, { ...existing, stage1: answerIndex });
      } else {
        newAnswers.set(currentQuestion.id, { ...existing, stage2: answerIndex });
      }
      
      return newAnswers;
    });

    // Record time for this stage
    const now = Date.now();
    setQuestionTimes(prev => {
      const newTimes = new Map(prev);
      const existing = newTimes.get(currentQuestion.id) || { stage1: 0, stage2: 0 };
      
      const questionStartTime = startTime + 
        Array.from(questionTimes.values()).reduce((sum, t) => sum + t.stage1 + t.stage2, 0);
      
      if (stage === 1) {
        newTimes.set(currentQuestion.id, { 
          ...existing, 
          stage1: now - questionStartTime 
        });
      } else {
        const stage1Time = existing.stage1 || 0;
        newTimes.set(currentQuestion.id, { 
          ...existing, 
          stage2: now - questionStartTime - stage1Time 
        });
      }
      
      return newTimes;
    });
  }, [currentQuestion, startTime, questionTimes]);

  const goToNextStage = useCallback(() => {
    if (currentStage === 1) {
      setCurrentStage(2);
    }
  }, [currentStage]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentStage(1);
    } else {
      setIsComplete(true);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const resetTest = useCallback(() => {
    clearProgressFromStorage();
    setCurrentQuestionIndex(0);
    setCurrentStage(1);
    setAnswers(new Map());
    setStartTime(Date.now());
    setQuestionTimes(new Map());
    setIsComplete(false);
  }, []);

  const submitTest = useCallback((): DiagnosticResult => {
    const result = calculateResult(answers);
    clearProgressFromStorage();
    
    // Store result in sessionStorage for result page
    if (typeof window !== "undefined") {
      sessionStorage.setItem("unitylearn_diagnostic_result", JSON.stringify(result));
    }
    
    return result;
  }, [answers]);

  const getElapsedTime = useCallback(() => {
    return Date.now() - startTime;
  }, [startTime]);

  return {
    currentQuestion,
    currentQuestionIndex,
    currentStage,
    totalQuestions,
    answers,
    currentStage1Answer,
    currentStage2Answer,
    isComplete,
    isLoading,
    selectAnswer,
    goToNextStage,
    goToNextQuestion,
    resetTest,
    submitTest,
    hasAnsweredCurrentStage,
    isCurrentStageCorrect: isCurrentStageCorrect(),
    getElapsedTime
  };
}
