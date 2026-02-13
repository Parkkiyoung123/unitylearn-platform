"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LevelBadge, ScoreBadge } from "@/components/diagnostic/LevelBadge";
import { 
  DiagnosticResult, 
  QuestionLevel,
  getLevelLabel,
  getLevelDescription 
} from "@/data/diagnostic-questions";
import { 
  Trophy,
  RotateCcw,
  Target,
  TrendingUp,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DiagnosticResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem("unitylearn_diagnostic_result");
    if (saved) {
      setResult(JSON.parse(saved));
    }
  }, []);

  const handleRestart = () => {
    sessionStorage.removeItem("unitylearn_diagnostic_result");
    router.push("/diagnostic");
  };

  const handleGoToLearn = () => {
    const level = result?.recommendedLevel || "beginner";
    router.push(`/quiz?level=${level}`);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">테스트 결과 없음</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              진단 테스트를 완료하지 않았거나 결과가 만료되었습니다.
            </p>
            <Button onClick={handleRestart} className="w-full">
              테스트 시작하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxScore = result.totalQuestions * 25;
  const percentage = (result.score / maxScore) * 100;

  const getLevelIcon = (level: QuestionLevel) => {
    switch (level) {
      case "beginner":
        return BookOpen;
      case "intermediate":
        return Zap;
      case "advanced":
        return BrainCircuit;
      default:
        return Target;
    }
  };

  const LevelIcon = getLevelIcon(result.recommendedLevel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Trophy className="w-4 h-4" />
            테스트 완료!
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold">
            진단 테스트 결과
          </h1>
          
          <p className="text-muted-foreground max-w-lg mx-auto">
            당신의 Unity 버그 진단 능력을 분석했습니다.
            <br />
            추천 학습 레벨을 확인하고 맞춤형 학습을 시작하세요.
          </p>
        </motion.div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  총점
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">
                    {result.score}
                    <span className="text-2xl text-muted-foreground">
                      {" "}/ {maxScore}
                    </span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-sm">
                    <span className={cn(
                      "font-medium",
                      percentage >= 80 ? "text-green-600" : 
                      percentage >= 50 ? "text-blue-600" : "text-amber-600"
                    )}>
                      {percentage.toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">달성</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={cn(
                        "h-full rounded-full",
                        percentage >= 80 ? "bg-green-500" : 
                        percentage >= 50 ? "bg-blue-500" : "bg-amber-500"
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>정답: {result.correctAnswers}/{result.totalQuestions}문제</span>
                    <span>{result.score}점</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommendation Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={cn(
              "h-full border-2",
              result.recommendedLevel === "beginner" ? 
                "border-emerald-200 bg-emerald-50/30" :
              result.recommendedLevel === "intermediate" ? 
                "border-blue-200 bg-blue-50/30" :
                "border-purple-200 bg-purple-50/30"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className={cn(
                    "w-5 h-5",
                    result.recommendedLevel === "beginner" ? "text-emerald-600" :
                    result.recommendedLevel === "intermediate" ? "text-blue-600" :
                      "text-purple-600"
                  )} />
                  추천 레벨
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-3">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center",
                      result.recommendedLevel === "beginner" ? "bg-emerald-100" :
                      result.recommendedLevel === "intermediate" ? "bg-blue-100" :
                        "bg-purple-100"
                    )}>
                      <LevelIcon className={cn(
                        "w-8 h-8",
                        result.recommendedLevel === "beginner" ? "text-emerald-600" :
                        result.recommendedLevel === "intermediate" ? "text-blue-600" :
                          "text-purple-600"
                      )} />
                    </div>
                    <div className="text-left">
                      <div className="text-3xl font-bold">
                        {getLevelLabel(result.recommendedLevel)}
                      </div>
                      <LevelBadge 
                        level={result.recommendedLevel} 
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  {getLevelDescription(result.recommendedLevel)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                상세 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.answers.map((answer, index) => (
                  <div
                    key={answer.questionId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        answer.points >= 25 
                          ? "bg-green-100 text-green-700" :
                        answer.points > 0
                          ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                      )}>
                        {index + 1}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">원인:</span>
                        {answer.stage1Correct ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        
                        <span className="text-sm text-muted-foreground">해결:</span>
                        {answer.stage2Correct ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="font-medium">
                      {answer.points}점
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            onClick={handleGoToLearn}
            size="lg"
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            추천 레벨로 학습 시작
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleRestart}
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            테스트 다시하기
          </Button>
          
          <Button 
            variant="ghost"
            onClick={handleGoHome}
            size="lg"
          >
            홈으로
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
