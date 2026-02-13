import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronRight, Lightbulb } from 'lucide-react'
import { QuizLevelBadge } from './QuizLevelBadge'
import type { QuizLevel } from '@/types/dashboard'

/**
 * RecommendedCard Props 인터페이스
 */
export interface RecommendedCardProps {
  /** 학습 아이템 ID */
  id: string
  /** 학습 제목 */
  title: string
  /** 카테고리 */
  category: string
  /** 추천 이유 */
  reason: string
  /** 난이도 */
  level?: QuizLevel
  /** 썸네일 URL (선택) */
  thumbnailUrl?: string
  /** 클릭 핸들러 */
  onClick?: () => void
  /** 추가 클래스명 */
  className?: string
}

/**
 * RecommendedCard 컴포넌트
 * 
 * 사용자에게 추천하는 학습 콘텐츠를 표시하는 카드 컴포넌트입니다.
 * 추천 이유와 함께 시각적으로 강조하여 표시합니다.
 * 
 * @example
 * ```tsx
 * <RecommendedCard
 *   id="rec-1"
 *   title="C# 스크립트 기초"
 *   category="프로그래밍"
 *   reason="최근 '변수' 개념을 학습하셨어요"
 *   level="Beginner"
 *   onClick={() => router.push('/learn/rec-1')}
 * />
 * ```
 */
const RecommendedCard = React.forwardRef<HTMLDivElement, RecommendedCardProps>(
  (
    {
      id,
      title,
      category,
      reason,
      level,
      thumbnailUrl,
      onClick,
      className,
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'group overflow-hidden transition-all duration-200',
          'hover:border-primary/30 hover:shadow-lg dark:hover:border-primary/30',
          'border-2 border-primary/10 dark:border-primary/10',
          className
        )}
      >
        {/* 썸네일 영역 */}
        {thumbnailUrl ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            {/* 추천 뱃지 */}
            <div className="absolute left-3 top-3">
              <div className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="h-3.5 w-3.5" />
                추천
              </div>
            </div>
            {/* 제목 (이미지 위에 표시) */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {category}
              </span>
              <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>
            </div>
          </div>
        ) : (
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  추천 학습
                </span>
              </div>
              {level && <QuizLevelBadge level={level} size="sm" />}
            </div>
            <div className="mt-3">
              <span className="text-xs text-muted-foreground">{category}</span>
              <CardTitle className="mt-1 text-lg">{title}</CardTitle>
            </div>
          </CardHeader>
        )}

        <CardContent className={cn(thumbnailUrl ? 'p-4 pt-0' : 'pt-0')}>
          {/* 추천 이유 */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 dark:bg-muted/30">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-sm text-muted-foreground">{reason}</p>
          </div>

          {/* CTA 버튼 */}
          <Button
            className="mt-4 w-full"
            onClick={onClick}
            aria-label={`${title} 학습 시작하기`}
          >
            지금 학습하기
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    )
  }
)

RecommendedCard.displayName = 'RecommendedCard'

export { RecommendedCard }
export default RecommendedCard
