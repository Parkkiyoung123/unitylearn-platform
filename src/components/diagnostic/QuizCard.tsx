"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  DiagnosticQuestion, 
  Stage, 
  QuestionLevel,
  getLevelLabel 
} from "@/data/diagnostic-questions";
import { LevelBadge } from "./LevelBadge";
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Bug,
  Lightbulb,
  AlertTriangle
} from "lucide-react";

interface QuizCardProps {
  question: DiagnosticQuestion;
  stage: 1 | 2;
  onAnswer: (stage: 1 | 2, answerIndex: number) => void;
  selectedAnswer?: number;
  showResult?: boolean;
  isCorrect?: boolean;
  onNext?: () => void;
}

export function QuizCard({
  question,
  stage,
  onAnswer,
  selectedAnswer,
  showResult = false,
  isCorrect = false,
  onNext
}: QuizCardProps) {
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  
  const currentStage = stage === 1 ? question.stage1 : question.stage2;
  const correctIndex = currentStage.correct;

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      {/* Header */}
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <LevelBadge level={question.level} size="sm" />
          <span className="text-sm text-muted-foreground">
            {stage === 1 ? "단계 1: 원인 분석" : "단계 2: 해결 방법"}
          </span>
        </div>
        
        {/* Scenario */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Bug className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                {question.scenario}
              </p>
              
              {question.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded px-3 py-2">
                  <code className="text-xs text-red-700 font-mono">
                    {question.errorMessage}
                  </code>
                </div>
              )}
              
              {question.symptoms.length > 0 && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  {question.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        {/* Question */}
        <div className="flex items-start gap-3 pt-2">
          <Lightbulb className={cn(
            "w-5 h-5 mt-0.5 shrink-0",
            stage === 1 ? "text-amber-500" : "text-green-500"
          )} />
          <CardTitle className="text-lg font-semibold">
            {currentStage.question}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Options */}
        <div className="space-y-2">
          {currentStage.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = showResult && index === correctIndex;
            const isWrongOption = showResult && isSelected && !isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => !showResult && onAnswer(stage, index)}
                onMouseEnter={() => setHoveredOption(index)}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={showResult}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                  "flex items-center gap-3",
                  showResult && "cursor-default",
                  !showResult && "cursor-pointer hover:border-primary/50 hover:bg-muted/50",
                  
                  // Selected state
                  isSelected && !showResult && "border-primary bg-primary/5",
                  
                  // Result states
                  isCorrectOption && "border-green-500 bg-green-50",
                  isWrongOption && "border-red-500 bg-red-50",
                  
                  // Default border
                  !isSelected && !showResult && "border-muted",
                  
                  // Hover animation
                  hoveredOption === index && !showResult && "transform scale-[1.01]"
                )}
              >
                {/* Option indicator */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors",
                  isCorrectOption 
                    ? "bg-green-500 text-white"
                    : isWrongOption
                    ? "bg-red-500 text-white"
                    : isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {String.fromCharCode(65 + index)}
                </div>
                
                {/* Option text */}
                <span className={cn(
                  "flex-1",
                  isCorrectOption && "text-green-800 font-medium",
                  isWrongOption && "text-red-800"
                )}>
                  {option}
                </span>
                
                {/* Result icons */}
                {showResult && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                )}
                {showResult && isWrongOption && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {showResult && (
          <div className={cn(
            "rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2",
            isCorrect 
              ? "bg-green-50 border border-green-200" 
              : "bg-red-50 border border-red-200"
          )}>
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">정답입니다!</p>
                  <p className="text-sm text-green-700">
                    {stage === 1 
                      ? "올바른 원인을 파악하셨습니다. 이제 해결 방법을 선택하세요."
                      : "완벽합니다! 다음 문제로 넘어가세요."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">틀렸습니다</p>
                  <p className="text-sm text-red-700">
                    정답은 <strong>{String.fromCharCode(65 + correctIndex)}. {currentStage.options[correctIndex]}</strong>입니다.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Next button */}
        {showResult && onNext && (
          <div className="pt-2">
            <Button 
              onClick={onNext}
              className="w-full"
              size="lg"
            >
              {stage === 1 ? "해결 방법 선택하기" : "다음 문제로"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
