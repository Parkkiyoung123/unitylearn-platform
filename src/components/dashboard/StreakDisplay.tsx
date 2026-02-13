import * as React from 'react'
import { cn } from '@/lib/utils'
import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * StreakDisplay Props 인터페이스
 */
export interface StreakDisplayProps {
  /** 현재 연속 학습 일수 */
  streakDays: number
  /** 최대 연속 학습 일수 (선택) */
  maxStreak?: number
  /** 추가 클래스명 */
  className?: string
}

/**
 * 스트릭에 따른 색상 및 애니메이션 설정
 */
const getStreakStyles = (streak: number) => {
  if (streak >= 30) {
    return {
      iconColor: 'text-rose-500 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
      borderColor: 'border-rose-200 dark:border-rose-800',
      flameAnimation: 'animate-pulse',
      label: '🔥 연속 30일+ 대단해요!',
    }
  }
  if (streak >= 14) {
    return {
      iconColor: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      flameAnimation: 'animate-pulse',
      label: '🔥 연속 2주 돌파!',
    }
  }
  if (streak >= 7) {
    return {
      iconColor: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
      flameAnimation: '',
      label: '🔥 일주일 연속 학습 중',
    }
  }
  if (streak >= 3) {
    return {
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      flameAnimation: '',
      label: '좋은 시작이에요!',
    }
  }
  return {
    iconColor: 'text-slate-400 dark:text-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    flameAnimation: '',
    label: '학습을 시작핳세요',
  }
}

/**
 * StreakDisplay 컴포넌트
 * 
 * 연속 학습 일수를 시각적으로 표시하는 컴포넌트입니다.
 * 불꽃 아이콘과 함께 일수를 강조하여 표시합니다.
 * 
 * @example
 * ```tsx
 * <StreakDisplay streakDays={7} maxStreak={14} />
 * <StreakDisplay streakDays={30} />
 * ```
 */
const StreakDisplay = React.forwardRef<HTMLDivElement, StreakDisplayProps>(
  ({ streakDays, maxStreak, className }, ref) => {
    const styles = getStreakStyles(streakDays)

    return (
      <Card
        ref={ref}
        className={cn(
          'overflow-hidden transition-all duration-200 hover:shadow-md',
          styles.bgColor,
          styles.borderColor,
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* 불꽃 아이콘 */}
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl',
                'bg-white/50 dark:bg-black/20',
                styles.flameAnimation
              )}
            >
              <Flame className={cn('h-8 w-8', styles.iconColor)} />
            </div>

            {/* 스트릭 정보 */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-3xl font-bold tracking-tight',
                    streakDays > 0
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {streakDays}
                </span>
                <span className="text-sm text-muted-foreground">일 연속</span>
              </div>

              {/* 최대 스트릭 표시 */}
              {maxStreak && maxStreak > streakDays && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  최고 기록: {maxStreak}일
                </p>
              )}

              {/* 동기부여 메시지 */}
              <p className={cn('mt-1.5 text-sm font-medium', styles.iconColor)}>
                {styles.label}
              </p>
            </div>
          </div>

          {/* 프로그레스 바 (최대 스트릭 기준) */}
          {maxStreak && maxStreak > 0 && (
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/50 dark:bg-black/20">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    streakDays >= 7 ? styles.iconColor.replace('text-', 'bg-') : 'bg-slate-400'
                  )}
                  style={{
                    width: `${Math.min((streakDays / maxStreak) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)

StreakDisplay.displayName = 'StreakDisplay'

export { StreakDisplay }
export default StreakDisplay
