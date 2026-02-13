/**
 * 레벨별 문제 목록 페이지
 * 
 * @description UnityLearn의 레벨별 퀴즈 목록 페이지입니다.
 * URL 검색 파라미터 (?level=Beginner)를 통해 레벨을 전환합니다.
 * 
 * @path /quizzes?level=Beginner|Intermediate|Advanced|Expert|Master
 */

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/server-session'
import { 
  getDashboardStats, 
  getQuizzesByLevel,
  getCachedDashboardStats,
  getCachedQuizzesByLevel 
} from '@/lib/dashboard-queries'
import { 
  UserLevel, 
  QuizLevel, 
  userLevelToQuizLevel,
  USER_LEVEL_ORDER 
} from '@/types/dashboard'
import { QuizzesContent } from './_components/QuizzesContent'
import { QuizzesSkeleton } from './_components/QuizzesSkeleton'

// ============================================================================
// Types
// ============================================================================

interface QuizzesPageProps {
  searchParams: { 
    level?: string 
    category?: string
  }
}

// ============================================================================
// Constants
// ============================================================================

const VALID_LEVELS: UserLevel[] = [
  'Beginner',
  'Intermediate', 
  'Advanced',
  'Expert',
  'Master'
]

const UNLOCK_THRESHOLD = 0.7 // 70% 완료 시 다음 레벨 해제

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 검색 파라미터에서 유효한 레벨을 추출
 */
function parseLevel(levelParam: string | undefined): UserLevel {
  if (!levelParam) return 'Beginner'
  
  const normalizedLevel = levelParam.charAt(0).toUpperCase() + 
    levelParam.slice(1).toLowerCase()
  
  if (VALID_LEVELS.includes(normalizedLevel as UserLevel)) {
    return normalizedLevel as UserLevel
  }
  
  return 'Beginner'
}

/**
 * 레벨별 잠금 상태 계산
 */
async function calculateLevelUnlockStatus(
  userId: string,
  currentLevel: UserLevel
): Promise<Record<UserLevel, { isUnlocked: boolean; progress: number }>> {
  const status: Record<UserLevel, { isUnlocked: boolean; progress: number }> = {
    Beginner: { isUnlocked: true, progress: 0 },
    Intermediate: { isUnlocked: false, progress: 0 },
    Advanced: { isUnlocked: false, progress: 0 },
    Expert: { isUnlocked: false, progress: 0 },
    Master: { isUnlocked: false, progress: 0 },
  }

  // 각 레벨별 완료율 계산
  for (const level of VALID_LEVELS) {
    const quizLevel = userLevelToQuizLevel(level)
    const quizzes = await getQuizzesByLevel(quizLevel, userId)
    
    const total = quizzes.length
    const completed = quizzes.filter(q => q.isCompleted).length
    const progress = total > 0 ? completed / total : 0
    
    status[level] = {
      isUnlocked: level === 'Beginner', // Beginner는 항상 열림
      progress,
    }
  }

  // 잠금 해제 로직: 이전 레벨 70% 이상 완료 시 다음 레벨 해제
  for (let i = 1; i < VALID_LEVELS.length; i++) {
    const prevLevel = VALID_LEVELS[i - 1]
    const currentLevel = VALID_LEVELS[i]
    
    if (status[prevLevel].progress >= UNLOCK_THRESHOLD) {
      status[currentLevel].isUnlocked = true
    }
  }

  return status
}

/**
 * 레벨별 완료/전체 카운트 계산
 */
async function getLevelCounts(
  userId: string
): Promise<{
  completedCounts: Record<UserLevel, number>
  totalCounts: Record<UserLevel, number>
}> {
  const completedCounts: Record<UserLevel, number> = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
    Expert: 0,
    Master: 0,
  }
  
  const totalCounts: Record<UserLevel, number> = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
    Expert: 0,
    Master: 0,
  }

  // 모든 레벨의 퀴즈 조회
  await Promise.all(
    VALID_LEVELS.map(async (userLevel) => {
      const quizLevel = userLevelToQuizLevel(userLevel)
      const quizzes = await getQuizzesByLevel(quizLevel, userId)
      
      totalCounts[userLevel] = quizzes.length
      completedCounts[userLevel] = quizzes.filter(q => q.isCompleted).length
    })
  )

  return { completedCounts, totalCounts }
}

// ============================================================================
// Metadata
// ============================================================================

import { Metadata } from 'next'

export async function generateMetadata({ 
  searchParams 
}: QuizzesPageProps): Promise<Metadata> {
  const level = parseLevel(searchParams.level)
  const levelNames: Record<UserLevel, string> = {
    Beginner: '입문자',
    Intermediate: '초급자',
    Advanced: '중급자',
    Expert: '고급자',
    Master: '마스터',
  }
  
  return {
    title: `${levelNames[level]} 레벨 퀴즈 | UnityLearn`,
    description: `${levelNames[level]} 레벨의 Unity 버그 진단 퀴즈를 풀어보세요.`,
  }
}

// ============================================================================
// Main Page Component
// ============================================================================

/**
 * 퀴즈 목록 페이지 (Server Component)
 * 
 * 데이터 fetching은 서버에서 수행하고,
 * 클라이언트 상호작용은 QuizzesContent로 위임합니다.
 */
export default async function QuizzesPage({ searchParams }: QuizzesPageProps) {
  // 인증 확인
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/quizzes')
  }

  const userId = session.isGuest ? session.id : session.userId
  const currentLevel = parseLevel(searchParams.level)
  const selectedCategory = searchParams.category

  // 병렬로 데이터 조회
  const [
    stats,
    { completedCounts, totalCounts },
    levelUnlockStatus
  ] = await Promise.all([
    getDashboardStats(userId),
    getLevelCounts(userId),
    calculateLevelUnlockStatus(userId, currentLevel)
  ])

  // 현재 레벨의 퀴즈 조회
  const quizLevel = userLevelToQuizLevel(currentLevel)
  const quizzes = await getQuizzesByLevel(quizLevel, userId)

  // 카테고리 목록 추출
  const categories = Array.from(new Set(quizzes.map(q => q.category)))

  // 카테고리 필터링 적용
  const filteredQuizzes = selectedCategory
    ? quizzes.filter(q => q.category === selectedCategory)
    : quizzes

  // 현재 레벨 진행률 계산
  const currentCompleted = completedCounts[currentLevel]
  const currentTotal = totalCounts[currentLevel]
  const currentProgress = currentTotal > 0 ? currentCompleted / currentTotal : 0
  
  // 다음 레벨 정보
  const currentLevelIndex = VALID_LEVELS.indexOf(currentLevel)
  const nextLevel = currentLevelIndex < VALID_LEVELS.length - 1 
    ? VALID_LEVELS[currentLevelIndex + 1] 
    : null
  const isNextLevelUnlocked = nextLevel ? levelUnlockStatus[nextLevel].isUnlocked : false
  const remainingToUnlock = nextLevel 
    ? Math.ceil(currentTotal * UNLOCK_THRESHOLD) - currentCompleted 
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<QuizzesSkeleton />}>
        <QuizzesContent
          currentLevel={currentLevel}
          quizzes={filteredQuizzes}
          categories={categories}
          selectedCategory={selectedCategory}
          completedCounts={completedCounts}
          totalCounts={totalCounts}
          levelUnlockStatus={levelUnlockStatus}
          currentProgress={currentProgress}
          currentCompleted={currentCompleted}
          currentTotal={currentTotal}
          nextLevel={nextLevel}
          isNextLevelUnlocked={isNextLevelUnlocked}
          remainingToUnlock={remainingToUnlock}
          userCurrentLevel={stats.currentLevel}
        />
      </Suspense>
    </div>
  )
}
