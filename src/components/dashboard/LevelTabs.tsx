import * as React from 'react'
import { cn } from '@/lib/utils'
import { LEVEL_CONFIG, type UserLevel } from '@/types/dashboard'
import { ProgressBar } from './ProgressBar'

/**
 * LevelTabs Props 인터페이스
 */
export interface LevelTabsProps {
  /** 현재 선택된 레벨 */
  currentLevel: UserLevel
  /** 레벨 변경 핸들러 */
  onLevelChange: (level: UserLevel) => void
  /** 레벨별 완료 개수 */
  completedCounts: Record<UserLevel, number>
  /** 레벨별 전체 개수 */
  totalCounts: Record<UserLevel, number>
  /** 추가 클래스명 */
  className?: string
}

/**
 * 레벨 순서 배열
 */
const LEVELS: UserLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master',
]

/**
 * LevelTabs 컴포넌트
 * 
 * 학습 레벨을 선택할 수 있는 탭 컴포넌트입니다.
 * 각 레벨별 진행률을 함께 표시합니다.
 * 
 * @example
 * ```tsx
 * <LevelTabs
 *   currentLevel="Intermediate"
 *   onLevelChange={(level) => setCurrentLevel(level)}
 *   completedCounts={{
 *     Beginner: 10,
 *     Intermediate: 5,
 *     Advanced: 0,
 *     Expert: 0,
 *     Master: 0,
 *   }}
 *   totalCounts={{
 *     Beginner: 20,
 *     Intermediate: 25,
 *     Advanced: 20,
 *     Expert: 15,
 *     Master: 10,
 *   }}
 * />
 * ```
 */
const LevelTabs = React.forwardRef<HTMLDivElement, LevelTabsProps>(
  (
    {
      currentLevel,
      onLevelChange,
      completedCounts,
      totalCounts,
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => {
            const config = LEVEL_CONFIG[level]
            const completed = completedCounts[level] || 0
            const total = totalCounts[level] || 0
            const isActive = currentLevel === level
            const hasProgress = total > 0

            return (
              <button
                key={level}
                onClick={() => onLevelChange(level)}
                className={cn(
                  'group relative flex flex-col items-start rounded-xl border-2 p-4',
                  'transition-all duration-200',
                  'min-w-[140px] flex-1 sm:min-w-[160px]',
                  isActive
                    ? cn(
                        config.borderColor,
                        config.bgColor,
                        'shadow-md'
                      )
                    : cn(
                        'border-border bg-card hover:border-primary/20 hover:bg-accent/50',
                        'dark:border-slate-700 dark:hover:border-slate-600'
                      )
                )}
                aria-pressed={isActive}
                aria-label={`${config.label} 레벨 선택`}
              >
                {/* 레벨명 및 레이블 */}
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      'text-sm font-bold',
                      isActive ? config.color : 'text-muted-foreground'
                    )}
                  >
                    {config.label}
                  </span>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-current" />
                  )}
                </div>

                {/* 진행률 표시 */}
                <div className="mt-2 w-full">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        'text-2xl font-bold',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {completed}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{total}
                    </span>
                  </div>

                  {/* 미니 프로그레스 바 */}
                  {hasProgress && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          config.color.replace('text-', 'bg-')
                        )}
                        style={{
                          width: `${Math.min((completed / total) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}

                  {/* 완료 상태 메시지 */}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {completed === total && total > 0
                      ? '완료! 🎉'
                      : completed > 0
                        ? `${Math.round((completed / total) * 100)}% 완료`
                        : '시작하기'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }
)

LevelTabs.displayName = 'LevelTabs'

export { LevelTabs }
export default LevelTabs
