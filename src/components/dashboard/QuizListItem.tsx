import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Lock,
  Play,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { QuizLevelBadge } from './QuizLevelBadge'
import type { QuizLevel } from '@/types/dashboard'

/**
 * QuizListItem Props 인터페이스
 */
export interface QuizListItemProps {
  /** 퀴즈 ID */
  id: string
  /** 퀴즈 제목 */
  title: string
  /** 카테고리 */
  category: string
  /** 난이도 */
  level: QuizLevel
  /** 완료 여부 */
  isCompleted: boolean
  /** 잠금 여부 */
  isLocked: boolean
  /** 클릭 핸들러 */
  onClick?: () => void
  /** 추가 클래스명 */
  className?: string
}

/**
 * 상태별 스타일 설정
 */
const statusStyles = {
  completed: {
    card: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10',
    icon: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    title: 'text-emerald-700 dark:text-emerald-300',
  },
  locked: {
    card: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 opacity-60',
    icon: 'text-slate-400 dark:text-slate-500',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    title: 'text-slate-500 dark:text-slate-400',
  },
  available: {
    card: 'border-border bg-card hover:border-primary/30 hover:shadow-md dark:hover:border-primary/30',
    icon: 'text-primary',
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    title: 'text-foreground',
  },
}

/**
 * QuizListItem 컴포넌트
 * 
 * 퀴즈 목록에서 개별 퀴즈 아이템을 표시하는 컴포넌트입니다.
 * 완료 상태, 잠금 상태에 따라 다른 스타일을 적용합니다.
 * 
 * @example
 * ```tsx
 * <QuizListItem
 *   id="quiz-1"
 *   title="Unity 기초: 씬 구성"
 *   category="기초"
 *   level="Beginner"
 *   isCompleted={true}
 *   isLocked={false}
 *   onClick={() => router.push('/quiz/quiz-1')}
 * />
 * ```
 */
const QuizListItem = React.forwardRef<HTMLDivElement, QuizListItemProps>(
  (
    { id, title, category, level, isCompleted, isLocked, onClick, className },
    ref
  ) => {
    // 상태 결정
    const status = isCompleted
      ? 'completed'
      : isLocked
        ? 'locked'
        : 'available'
    const styles = statusStyles[status]

    return (
      <Card
        ref={ref}
        className={cn(
          'overflow-hidden transition-all duration-200',
          styles.card,
          !isLocked && 'cursor-pointer',
          className
        )}
        onClick={!isLocked ? onClick : undefined}
      >
        <CardContent className="flex items-center gap-4 p-4">
          {/* 상태 아이콘 */}
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              styles.iconBg
            )}
          >
            {isCompleted ? (
              <CheckCircle className={cn('h-6 w-6', styles.icon)} />
            ) : isLocked ? (
              <Lock className={cn('h-6 w-6', styles.icon)} />
            ) : (
              <BookOpen className={cn('h-6 w-6', styles.icon)} />
            )}
          </div>

          {/* 퀴즈 정보 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {category}
              </span>
              <span className="text-muted-foreground">·</span>
              <QuizLevelBadge level={level} showLabel={false} size="sm" />
            </div>
            <h4
              className={cn(
                'mt-0.5 truncate text-sm font-semibold',
                styles.title
              )}
            >
              {title}
            </h4>
          </div>

          {/* 액션 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 shrink-0',
              isLocked && 'pointer-events-none opacity-0'
            )}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
            disabled={isLocked}
            aria-label={isCompleted ? '다시 학습하기' : '학습 시작하기'}
          >
            {isCompleted ? (
              <Play className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }
)

QuizListItem.displayName = 'QuizListItem'

export { QuizListItem }
export default QuizListItem
