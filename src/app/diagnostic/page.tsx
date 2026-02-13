"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDiagnostic } from "@/hooks/useDiagnostic";
import { QuizCard } from "@/components/diagnostic/QuizCard";
import { ProgressBar } from "@/components/diagnostic/ProgressBar";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Brain,
  RotateCcw,
  ChevronRight,
  Clock,
  AlertTriangle,
  Sparkles
} from "lucide-react";

export default function DiagnosticPage() {
  const router = useRouter();
  const {
    currentQuestion,
    currentQuestionIndex,
    currentStage,
    totalQuestions,
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
    isCurrentStageCorrect
  } = useDiagnostic();

  // Handle test completion
  useEffect(() => {
    if (isComplete) {
      submitTest();
      router.push("/diagnostic/result");
    }
  }, [isComplete, submitTest, router]);

  const handleAnswer = useCallback((stage: 1 | 2, answerIndex: number) => {
    selectAnswer(stage, answerIndex);
  }, [selectAnswer]);

  const handleNext = useCallback(() => {
    if (currentStage === 1) {
      goToNextStage();
    } else {
      goToNextQuestion();
    }
  }, [currentStage, goToNextStage, goToNextQuestion]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">버그 진단 테스트</h1>
                <p className="text-sm text-muted-foreground">
                  당신의 Unity 디버깅 능력을 평가합니다
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    다시 시작
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>테스트를 다시 시작할까요?</AlertDialogTitle>
                    <AlertDialogDescription>
                      현재 진행 상황이 모두 초기화됩니다.
                      <br />
                      정말로 다시 시작하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={resetTest}>
                      다시 시작
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-4 max-w-2xl">
            <ProgressBar
              current={currentQuestionIndex + 1}
              total={totalQuestions}
              stage={currentStage}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentQuestion.id}-${currentStage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <QuizCard
              question={currentQuestion}
              stage={currentStage}
              onAnswer={handleAnswer}
              selectedAnswer={currentStage === 1 ? currentStage1Answer : currentStage2Answer}
              showResult={hasAnsweredCurrentStage}
              isCorrect={isCurrentStageCorrect}
              onNext={handleNext}
            />

            {/* Navigation hint */}
            {!hasAnsweredCurrentStage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center text-sm text-muted-foreground"
              >
                <p>정답을 선택하세요</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tips card */}
        <Card className="max-w-3xl mx-auto mt-8 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              테스트 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                각 문제는 <strong>원인 분석</strong>과 <strong>해결 방법</strong> 2단계로 구성됩니다.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                2단계 모두 정답이면 추가 점수가 부여됩니다.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                테스트 중간에 나가도 진행 상황이 저장됩니다. (24시간 유효)
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
