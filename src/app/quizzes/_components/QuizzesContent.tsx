'use client'

/**
 * 퀴즈 목록 페이지 컨텐츠 (Client Component)
 * 
 * @description 검색 파라미터 처리와 클라이언트 상호작용을 담당합니다.
 * 
 * UI is a function of state:
 * - currentLevel (from URL)
 * - selectedCategory (from URL)
 * - quizzes (filtered)
 */

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Lock, 
  Unlock, 
  ChevronRight, 
  BookOpen,
  Filter,
  CheckCircle2,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { LevelTabs } from '@/components/dashboard/LevelTabs'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { LevelBadge } from '@/components/dashboard/LevelBadge'
import type { 
  UserLevel, 
  LevelQuizItem,
  LEVEL_CONFIG 
} from '@/types/dashboard'

// ============================================================================
// Types
// ============================================================================

export interface QuizzesContentProps {
  currentLevel: UserLevel
  quizzes: LevelQuizItem[]
  categories: string[]
  selectedCategory?: string
  completedCounts: Record<UserLevel, number>
  totalCounts: Record<UserLevel, number>
  levelUnlockStatus: Record<UserLevel, { isUnlocked: boolean; progress: number }>
  currentProgress: number
  currentCompleted: number
  currentTotal: number
  nextLevel: UserLevel | null
  isNextLevelUnlocked: boolean
  remainingToUnlock: number
  userCurrentLevel: UserLevel
}

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
}

// ============================================================================
// Component
// ============================================================================

export function QuizzesContent({
  currentLevel,
  quizzes,
  categories,
  selectedCategory,
  completedCounts,
  totalCounts,
  levelUnlockStatus,
  currentProgress,
  currentCompleted,
  currentTotal,
  nextLevel,
  isNextLevelUnlocked,
  remainingToUnlock,
  userCurrentLevel,
}: QuizzesContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 레벨 변경 핸들러 - URL 업데이트
  const handleLevelChange = useCallback((level: UserLevel) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('level', level)
    // 레벨 변경 시 카테고리 필터 초기화
    params.delete('category')
    router.push(`/quizzes?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // 카테고리 필터 변경 핸들러
  const handleCategoryChange = useCallback((category: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`/quizzes?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // 퀴즈 클릭 핸들러
  const handleQuizClick = useCallback((quizId: string) => {
    router.push(`/quiz/${quizId}`)
  }, [router])

  // 다음 레벨로 이동
  const handleNextLevel = useCallback(() => {
    if (nextLevel && isNextLevelUnlocked) {
      const params = new URLSearchParams()
      params.set('level', nextLevel)
      router.push(`/quizzes?${params.toString()}`, { scroll: false })
    }
  }, [router, nextLevel, isNextLevelUnlocked])

  const levelConfig = {
    Beginner: { label: '입문자', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    Intermediate: { label: '초급자', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    Advanced: { label: '중급자', color: 'text-violet-600', bgColor: 'bg-violet-100' },
    Expert: { label: '고급자', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    Master: { label: '마스터', color: 'text-rose-600', bgColor: 'bg-rose-100' },
  }

  const currentConfig = levelConfig[currentLevel]

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                문제 목록
              </h1>
              <p className="mt-1 text-muted-foreground">
                레벨별 Unity 버그 진단 문제를 풀어보세요
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LevelBadge level={userCurrentLevel} showLabel size="md" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Level Tabs */}
        <section>
          <LevelTabs
            currentLevel={currentLevel}
            onLevelChange={handleLevelChange}
            completedCounts={completedCounts}
            totalCounts={totalCounts}
          />
        </section>

        {/* Progress Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Level Progress */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {currentConfig.label} 레벨 진행 상황
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentCompleted} / {currentTotal} 문제 완료
                  </p>
                </div>
                <div className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  currentConfig.bgColor,
                  currentConfig.color
                )}>
                  {Math.round(currentProgress * 100)}%
                </div>
              </div>
              <ProgressBar
                current={currentCompleted}
                total={currentTotal}
                showPercentage={false}
                size="md"
                variant={currentProgress >= 0.7 ? 'success' : 'default'}
              />
            </CardContent>
          </Card>

          {/* Next Level Status */}
          <Card>
            <CardContent className="p-6">
              {nextLevel ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    {isNextLevelUnlocked ? (
                      <Unlock className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold text-foreground">
                      다음 레벨
                    </h3>
                  </div>
                  <p className={cn(
                    'text-2xl font-bold',
                    isNextLevelUnlocked ? 'text-emerald-600' : 'text-muted-foreground'
                  )}>
                    {levelConfig[nextLevel].label}
                  </p>
                  {isNextLevelUnlocked ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 w-full"
                      onClick={handleNextLevel}
                    >
                      이동하기
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      {remainingToUnlock > 0 
                        ? `${remainingToUnlock}문제 더 풀면 해제`
                        : '70% 완료 시 해제됩니다'
                      }
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Trophy className="w-8 h-8 text-amber-500 mb-3" />
                  <h3 className="font-semibold text-foreground">최고 레벨!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    모든 레벨을 달성했습니다
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Category Filter */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">카테고리 필터</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedCategory ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(null)}
              >
                전체
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </section>
        )}

        {/* Quiz Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {currentConfig.label} 문제
              {selectedCategory && (
                <span className="text-muted-foreground font-normal ml-2">
                  · {selectedCategory}
                </span>
              )}
            </h2>
            <span className="text-sm text-muted-foreground">
              총 {quizzes.length}개
            </span>
          </div>

          <AnimatePresence mode="wait">
            {quizzes.length > 0 ? (
              <motion.div
                key={`${currentLevel}-${selectedCategory || 'all'}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {quizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onClick={() => handleQuizClick(quiz.id)}
                  />
                ))}
              </motion.div>
            ) : (
              <EmptyState level={currentLevel} />
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface QuizCardProps {
  quiz: LevelQuizItem
  onClick: () => void
}

function QuizCard({ quiz, onClick }: QuizCardProps) {
  const isLocked = quiz.isLocked
  const isCompleted = quiz.isCompleted

  return (
    <motion.div variants={itemVariants}>
      <button
        onClick={!isLocked ? onClick : undefined}
        disabled={isLocked}
        className={cn(
          'w-full text-left group',
          isLocked && 'cursor-not-allowed'
        )}
      >
        <Card
          className={cn(
            'h-full transition-all duration-200 overflow-hidden',
            'border-2',
            !isLocked && [
              'hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5',
              'active:scale-[0.99]',
            ],
            isLocked && 'opacity-60 bg-muted/50',
            isCompleted && 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-900/10'
          )}
        >
          <CardContent className="p-5 space-y-4">
            {/* Header: Category & Status */}
            <div className="flex items-start justify-between gap-2">
              <Badge variant="secondary" className="font-medium">
                <BookOpen className="w-3 h-3 mr-1" />
                {quiz.category}
              </Badge>
              
              {isCompleted && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              {isLocked && (
                <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              {!isCompleted && !isLocked && (
                <Play className="w-5 h-5 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            {/* Title */}
            <div>
              <h3 className={cn(
                'font-semibold text-lg line-clamp-2',
                isCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'
              )}>
                {quiz.title}
              </h3>
            </div>

            {/* Footer: Level & Action */}
            <div className="flex items-center justify-between pt-2">
              <DifficultyBadge level={quiz.level} />
              
              <span className={cn(
                'text-sm font-medium flex items-center gap-1',
                isLocked ? 'text-muted-foreground' : 'text-primary'
              )}>
                {isCompleted ? '다시 풀기' : isLocked ? '잠김' : '풀기'}
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </CardContent>
        </Card>
      </button>
    </motion.div>
  )
}

interface DifficultyBadgeProps {
  level: 'Easy' | 'Medium' | 'Hard'
}

function DifficultyBadge({ level }: DifficultyBadgeProps) {
  const config = {
    Easy: { label: '쉬움', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    Medium: { label: '보통', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    Hard: { label: '어려움', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  }

  const { label, className } = config[level]

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', className)}>
      {label}
    </span>
  )
}

interface EmptyStateProps {
  level: UserLevel
}

function EmptyState({ level }: EmptyStateProps) {
  const levelNames: Record<UserLevel, string> = {
    Beginner: '입문자',
    Intermediate: '초급자',
    Advanced: '중급자',
    Expert: '고급자',
    Master: '마스터',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full py-16 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        이 레벨의 문제가 없습니다
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        {levelNames[level]} 레벨의 문제가 아직 준비되지 않았습니다.
        <br />
        곧 추가될 예정입니다!
      </p>
    </motion.div>
  )
}
