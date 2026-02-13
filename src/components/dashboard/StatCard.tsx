import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { StatCardVariant } from '@/types/dashboard'

/**
 * StatCard Props 인터페이스
 */
export interface StatCardProps {
  /** 카드 제목 */
  title: string
  /** 표시할 값 */
  value: string | number
  /** 부제목 (선택) */
  subtitle?: string
  /** 아이콘 컴포넌트 */
  icon: React.ReactNode
  /** 트렌드 정보 (선택) */
  trend?: {
    value: number
    isPositive: boolean
  }
  /** 카드 변형 */
  variant?: StatCardVariant
  /** 추가 클래스명 */
  className?: string
}

/**
 * 변형별 스타일 설정
 */
const variantStyles: Record<
  StatCardVariant,
  {
    iconBg: string
    iconColor: string
    trendColor: string
  }
> = {
  default: {
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconColor: 'text-primary',
    trendColor: 'text-muted-foreground',
  },
  success: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    trendColor: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    trendColor: 'text-amber-600 dark:text-amber-400',
  },
  danger: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    trendColor: 'text-rose-600 dark:text-rose-400',
  },
}

/**
 * StatCard 컴포넌트
 * 
 * 대시보드에서 통계를 표시하는 카드 컴포넌트입니다.
 * 아이콘, 값, 트렌드를 함께 표시합니다.
 * 
 * @example
 * ```tsx
 * <StatCard
 *   title="완료한 퀴즈"
 *   value="42"
 *   subtitle="전체 100문제 중"
 *   icon={<Trophy className="h-5 w-5" />}
 *   trend={{ value: 12, isPositive: true }}
 *   variant="success"
 * />
 * ```
 */
const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, subtitle, icon, trend, variant = 'default', className }, ref) => {
    const styles = variantStyles[variant]

    return (
      <Card
        ref={ref}
        className={cn(
          'overflow-hidden transition-all duration-200 hover:shadow-md',
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* 아이콘 영역 */}
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                styles.iconBg
              )}
            >
              <div className={styles.iconColor}>{icon}</div>
            </div>

            {/* 트렌드 표시 */}
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  trend.isPositive ? styles.trendColor : 'text-muted-foreground'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>

          {/* 값과 제목 영역 */}
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {title}
            </p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {subtitle}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)

StatCard.displayName = 'StatCard'

export { StatCard }
export default StatCard
