import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * ProgressBar Props 인터페이스
 */
export interface ProgressBarProps {
  /** 현재 값 */
  current: number
  /** 전체 값 */
  total: number
  /** 레이블 (선택) */
  label?: string
  /** 퍼센트 표시 여부 */
  showPercentage?: boolean
  /** 크기 변형 */
  size?: 'sm' | 'md' | 'lg'
  /** 색상 변형 */
  variant?: 'default' | 'success' | 'warning' | 'danger'
  /** 추가 클래스명 */
  className?: string
}

/**
 * 크기별 스타일 설정
 */
const sizeStyles = {
  sm: {
    height: 'h-1.5',
    text: 'text-xs',
    spacing: 'space-y-1',
  },
  md: {
    height: 'h-2.5',
    text: 'text-sm',
    spacing: 'space-y-2',
  },
  lg: {
    height: 'h-4',
    text: 'text-base',
    spacing: 'space-y-2',
  },
}

/**
 * 변형별 색상 설정
 */
const variantStyles = {
  default: {
    bg: 'bg-primary/20 dark:bg-primary/30',
    fill: 'bg-primary',
  },
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    fill: 'bg-emerald-500 dark:bg-emerald-400',
  },
  warning: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    fill: 'bg-amber-500 dark:bg-amber-400',
  },
  danger: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    fill: 'bg-rose-500 dark:bg-rose-400',
  },
}

/**
 * ProgressBar 컴포넌트
 * 
 * 진행률을 시각적으로 표시하는 프로그레스 바 컴포넌트입니다.
 * 
 * @example
 * ```tsx
 * <ProgressBar
 *   current={45}
 *   total={100}
 *   label="퀴즈 진행률"
 *   showPercentage
 *   size="md"
 *   variant="success"
 * />
 * ```
 */
const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      current,
      total,
      label,
      showPercentage = true,
      size = 'md',
      variant = 'default',
      className,
    },
    ref
  ) => {
    // 퍼센트 계산
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100)

    const sizeStyle = sizeStyles[size]
    const variantStyle = variantStyles[variant]

    return (
      <div ref={ref} className={cn('w-full', sizeStyle.spacing, className)}>
        {/* 레이블 및 퍼센트 영역 */}
        {(label || showPercentage) && (
          <div className="flex items-center justify-between">
            {label && (
              <span
                className={cn(
                  'font-medium text-foreground',
                  sizeStyle.text
                )}
              >
                {label}
              </span>
            )}
            {showPercentage && (
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  sizeStyle.text,
                  variant === 'default'
                    ? 'text-primary'
                    : variantStyle.fill.replace('bg-', 'text-')
                )}
              >
                {clampedPercentage}%
              </span>
            )}
          </div>
        )}

        {/* 프로그레스 바 */}
        <div
          className={cn(
            'w-full overflow-hidden rounded-full',
            sizeStyle.height,
            variantStyle.bg
          )}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={label || '진행률'}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              variantStyle.fill
            )}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>

        {/* 현재/전체 값 표시 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{current} 완료</span>
          <span>전체 {total}</span>
        </div>
      </div>
    )
  }
)

ProgressBar.displayName = 'ProgressBar'

export { ProgressBar }
export default ProgressBar
