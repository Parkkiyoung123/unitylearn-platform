import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw, X } from 'lucide-react'
import { ProgressBar } from './ProgressBar'

/**
 * ContinueBanner Props 인터페이스
 */
export interface ContinueBannerProps {
  /** 퀴즈 제목 */
  quizTitle: string
  /** 진행률 (0-100) */
  progressPercent: number
  /** 카테고리 (선택) */
  category?: string
  /** 이어하기 핸들러 */
  onContinue: () => void
  /** 다시 시작 핸들러 (선택) */
  onRestart?: () => void
  /** 닫기 핸들러 (선택) */
  onDismiss?: () => void
  /** 추가 클래스명 */
  className?: string
}

/**
 * ContinueBanner 컴포넌트
 * 
 * 진행 중이던 학습을 이어할 수 있도록 유도하는 배너 컴포넌트입니다.
 * 진행률을 시각적으로 표시하고 빠른 접근을 제공합니다.
 * 
 * @example
 * ```tsx
 * <ContinueBanner
 *   quizTitle="Unity 물리 엔진 마스터"
 *   progressPercent={65}
 *   category="물리"
 *   onContinue={() => router.push('/quiz/continue')}
 *   onRestart={() => handleRestart()}
 *   onDismiss={() => setShowBanner(false)}
 * />
 * ```
 */
const ContinueBanner = React.forwardRef<HTMLDivElement, ContinueBannerProps>(
  (
    {
      quizTitle,
      progressPercent,
      category,
      onContinue,
      onRestart,
      onDismiss,
      className,
    },
    ref
  ) => {
    // 진행률에 따른 색상
    const getProgressColor = (percent: number) => {
      if (percent >= 75) return 'success'
      if (percent >= 50) return 'default'
      if (percent >= 25) return 'warning'
      return 'danger'
    }

    const progressVariant = getProgressColor(progressPercent)

    return (
      <Card
        ref={ref}
        className={cn(
          'relative overflow-hidden border-2 border-primary/20',
          'bg-gradient-to-br from-primary/5 via-background to-background',
          'dark:from-primary/10',
          className
        )}
      >
        {/* 닫기 버튼 */}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onDismiss}
            aria-label="배너 닫기"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* 아이콘 및 제목 영역 */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Play className="h-6 w-6 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  이어서 학습하기
                </p>
                <h3 className="truncate text-lg font-bold text-foreground">
                  {quizTitle}
                </h3>
                {category && (
                  <p className="text-sm text-muted-foreground">{category}</p>
                )}
              </div>
            </div>

            {/* 프로그레스 및 버튼 영역 */}
            <div className="flex flex-col gap-3 sm:w-64 sm:shrink-0">
              <ProgressBar
                current={Math.round(progressPercent)}
                total={100}
                showPercentage
                size="sm"
                variant={progressVariant}
              />

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={onContinue}
                  aria-label={`${quizTitle} 이어서 학습하기`}
                >
                  <Play className="mr-2 h-4 w-4" />
                  이어하기
                </Button>

                {onRestart && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onRestart}
                    aria-label="처음부터 다시 시작"
                    title="처음부터 다시 시작"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

ContinueBanner.displayName = 'ContinueBanner'

export { ContinueBanner }
export default ContinueBanner
