import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { QUIZ_LEVEL_CONFIG, quizLevelToUserLevel, type QuizLevel, type UserLevel } from '@/types/dashboard'

/**
 * QuizLevelBadge Props 인터페이스
 */
export interface QuizLevelBadgeProps {
  /** 퀴즈 레벨 */
  level: QuizLevel
  /** 레이블 표시 여부 */
  showLabel?: boolean
  /** 크기 변형 */
  size?: 'sm' | 'md' | 'lg'
  /** 추가 클래스명 */
  className?: string
}

/**
 * 크기별 스타일 설정
 */
const sizeStyles = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1',
  },
  md: {
    badge: 'px-2.5 py-0.5 text-sm',
    icon: 'h-4 w-4',
    gap: 'gap-1.5',
  },
  lg: {
    badge: 'px-3 py-1 text-base',
    icon: 'h-5 w-5',
    gap: 'gap-2',
  },
}

/**
 * 레벨별 아이콘 (별점 스타일)
 */
const LevelIcon = ({
  level,
  className,
}: {
  level: QuizLevel | UserLevel
  className?: string
}) => {
  // 레벨별 별 개수
  const getStarCount = (lvl: QuizLevel | UserLevel): number => {
    if (lvl === 'Beginner' || lvl === 'Easy') return 1
    if (lvl === 'Intermediate' || lvl === 'Medium') return 2
    if (lvl === 'Advanced' || lvl === 'Hard') return 3
    if (lvl === 'Expert') return 4
    if (lvl === 'Master') return 5
    return 1
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

/**
 * QuizLevelBadge 컴포넌트
 * 
 * 퀴즈의 난이도 레벨을 표시하는 뱃지 컴포넌트입니다.
 * QuizLevel(Easy, Medium, Hard)을 사용합니다.
 * 
 * @example
 * ```tsx
 * <QuizLevelBadge level="Medium" showLabel size="md" />
 * <QuizLevelBadge level="Hard" size="lg" />
 * ```
 */
const QuizLevelBadge: React.FC<QuizLevelBadgeProps> = ({
  level,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const config = QUIZ_LEVEL_CONFIG[level]
  const styles = sizeStyles[size]

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center font-semibold transition-colors',
        config.bgColor,
        config.color,
        config.borderColor,
        styles.badge,
        styles.gap,
        className
      )}
    >
      <LevelIcon level={level} className={styles.icon} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  )
}

QuizLevelBadge.displayName = 'QuizLevelBadge'

export { QuizLevelBadge }
export default QuizLevelBadge
