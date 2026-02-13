/**
 * 대시보드 데이터 조회 Server Actions
 * 
 * @description 대시보드에 필요한 모든 데이터를 조회하는 Server Actions를 제공합니다.
 * React cache()를 사용하여 요청 내 캐싱을 지원합니다.
 * 
 * @author Dashboard Team
 * @since 2024
 */

'use server'

import { unstable_cache } from 'next/cache'
import { prisma } from './db'
import {
  DashboardStats,
  LevelQuizItem,
  RecommendedQuiz,
  ContinueLearning,
  CategoryProgressMap,
  UserLevel,
  QuizLevel,
  LEVEL_ORDER,
} from '@/types/dashboard'

// ============================================================================
// Cache Configuration
// ============================================================================

/**
 * 대시보드 데이터 캐시 태그
 */
const CACHE_TAGS = {
  stats: (userId: string) => `dashboard-stats-${userId}`,
  quizzes: (level: string) => `quizzes-${level}`,
  recommendations: (userId: string) => `recommendations-${userId}`,
  continueLearning: (userId: string) => `continue-${userId}`,
} as const

/**
 * 캐시 재검증 시간 (초)
 */
const CACHE_REVALIDATE_SECONDS = 60

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 이번 주 시작일 (월요일 00:00:00) 계산
 */
function getWeekStart(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = 일요일, 1 = 월요일, ...
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // 월요일로 조정
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

/**
 * 취약 카테고리 분석
 * 정확도가 60% 미만인 카테고리를 취약 카테고리로 판단
 */
function analyzeWeakCategories(categoryProgress: CategoryProgressMap | null | undefined): string[] {
  if (!categoryProgress) return []
  
  const weakCategories: string[] = []
  
  for (const [categoryName, progress] of Object.entries(categoryProgress)) {
    if (progress.attempts >= 3) { // 최소 3회 이상 시도한 경우만 분석
      const accuracy = progress.attempts > 0 ? (progress.correct / progress.attempts) * 100 : 0
      if (accuracy < 60) {
        weakCategories.push(categoryName)
      }
    }
  }
  
  return weakCategories
}

/**
 * 이전 레벨 완료 여부 확인
 */
async function isPreviousLevelCompleted(
  userId: string,
  targetLevel: QuizLevel
): Promise<boolean> {
  const targetOrder = LEVEL_ORDER[targetLevel]
  
  // Easy는 항상 열림
  if (targetOrder === 1) return true
  
  // 이전 레벨 찾기
  const previousLevel = Object.entries(LEVEL_ORDER).find(([, order]) => order === targetOrder - 1)?.[0] as QuizLevel | undefined
  
  if (!previousLevel) return true
  
  // 해당 레벨의 모든 퀴즈 수
  const totalQuizzesInPreviousLevel = await prisma.quiz.count({
    where: { level: previousLevel, isActive: true },
  })
  
  if (totalQuizzesInPreviousLevel === 0) return true
  
  // 사용자가 완료한 이전 레벨 퀴즈 수
  const completedQuizzesInPreviousLevel = await prisma.quizAttempt.count({
    where: {
      userId,
      quiz: { level: previousLevel },
      isCorrect: true,
    },
    distinct: ['quizId'],
  })
  
  // 70% 이상 완료 시 다음 레벨 잠금 해제
  return completedQuizzesInPreviousLevel >= Math.ceil(totalQuizzesInPreviousLevel * 0.7)
}

/**
 * 사용자가 특정 레벨을 완료했는지 확인
 */
async function getCompletedQuizIds(userId: string): Promise<Set<string>> {
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId,
      isCorrect: true,
    },
    select: { quizId: true },
    distinct: ['quizId'],
  })
  
  return new Set(attempts.map(a => a.quizId))
}

// ============================================================================
// Main Query Functions
// ============================================================================

/**
 * 대시보드 통계 데이터 조회
 * 
 * @param userId 사용자 ID
 * @returns DashboardStats 통계 데이터
 * 
 * @example
 * ```typescript
 * const stats = await getDashboardStats('user-123')
 * console.log(stats.accuracy) // 85.5
 * ```
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // 사용자 진행 상황 조회
    const [userProgress, user] = await Promise.all([
      prisma.userProgress.findUnique({
        where: { userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { level: true, streak: true },
      }),
    ])
    
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    
    // 이번 주 시도 횟수 계산
    const weekStart = getWeekStart()
    const weeklyAttempts = await prisma.quizAttempt.count({
      where: {
        userId,
        attemptDate: {
          gte: weekStart,
        },
      },
    })
    
    // 진행 상황이 없으면 기본값 반환
    if (!userProgress) {
      return {
        currentLevel: user.level as UserLevel,
        totalAttempts: 0,
        correctCount: 0,
        accuracy: 0,
        streakDays: user.streak,
        weeklyProgress: weeklyAttempts,
        weakCategories: [],
      }
    }
    
    // 취약 카테고리 분석
    const weakCategories = analyzeWeakCategories(
      userProgress.categoryProgress as CategoryProgressMap | undefined
    )
    
    return {
      currentLevel: userProgress.currentLevel as UserLevel,
      totalAttempts: userProgress.totalAttempts,
      correctCount: userProgress.correctCount,
      accuracy: userProgress.accuracy,
      streakDays: user.streak,
      weeklyProgress: weeklyAttempts,
      weakCategories,
    }
  } catch (error) {
    console.error('[Dashboard] Failed to get dashboard stats:', error)
    
    // 에러 발생 시 기본값 반환 (UX를 위해)
    return {
      currentLevel: 'Beginner' as UserLevel,
      totalAttempts: 0,
      correctCount: 0,
      accuracy: 0,
      streakDays: 0,
      weeklyProgress: 0,
      weakCategories: [],
    }
  }
}

/**
 * 캐싱된 대시보드 통계 조회
 */
export const getCachedDashboardStats = unstable_cache(
  async (userId: string) => getDashboardStats(userId),
  ['dashboard-stats'],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: (userId) => [CACHE_TAGS.stats(userId)],
  }
)

/**
 * 레벨별 퀴즈 목록 조회
 * 
 * @param level 퀴즈 레벨 (Easy, Medium, Hard)
 * @param userId 사용자 ID
 * @returns LevelQuizItem[] 퀴즈 목록
 * 
 * @example
 * ```typescript
 * const quizzes = await getQuizzesByLevel('Medium', 'user-123')
 * ```
 */
export async function getQuizzesByLevel(
  level: QuizLevel,
  userId: string
): Promise<LevelQuizItem[]> {
  try {
    // 병렬로 데이터 조회
    const [quizzes, completedQuizIds, isUnlocked] = await Promise.all([
      prisma.quiz.findMany({
        where: {
          level,
          isActive: true,
        },
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      getCompletedQuizIds(userId),
      isPreviousLevelCompleted(userId, level),
    ])
    
    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      category: quiz.category.name,
      level: quiz.level as QuizLevel,
      isCompleted: completedQuizIds.has(quiz.id),
      isLocked: !isUnlocked,
    }))
  } catch (error) {
    console.error('[Dashboard] Failed to get quizzes by level:', error)
    return []
  }
}

/**
 * 캐싱된 레벨별 퀴즈 목록 조회
 */
export const getCachedQuizzesByLevel = unstable_cache(
  async (level: QuizLevel, userId: string) => getQuizzesByLevel(level, userId),
  ['quizzes-by-level'],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: (level) => [CACHE_TAGS.quizzes(level)],
  }
)

/**
 * 추천 퀴즈 목록 조회
 * 
 * 사용자 레벨과 취약 카테고리를 기반으로 추천 퀴즈를 제공합니다.
 * 
 * @param userId 사용자 ID
 * @returns RecommendedQuiz[] 추천 퀴즈 목록 (최대 5개)
 * 
 * @example
 * ```typescript
 * const recommendations = await getRecommendedQuizzes('user-123')
 * ```
 */
export async function getRecommendedQuizzes(userId: string): Promise<RecommendedQuiz[]> {
  try {
    // 사용자 정보와 진행 상황 조회
    const [user, userProgress, completedAttempts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { level: true },
      }),
      prisma.userProgress.findUnique({
        where: { userId },
        select: { categoryProgress: true },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        select: { quizId: true },
        distinct: ['quizId'],
      }),
    ])
    
    if (!user) {
      return []
    }
    
    const completedQuizIds = new Set(completedAttempts.map(a => a.quizId))
    const categoryProgress = (userProgress?.categoryProgress || {}) as CategoryProgressMap
    
    // 취약 카테고리 식별
    const weakCategoryNames = analyzeWeakCategories(categoryProgress)
    
    // 추천 퀴즈 조회 전략:
    // 1. 취약 카테고리의 미완료 퀴즈 우선
    // 2. 사용자 레벨에 맞는 퀴즈
    // 3. 아직 풀지 않은 퀴즈
    
    let recommendedQuizzes: RecommendedQuiz[] = []
    
    // 1단계: 취약 카테고리의 퀴즈 조회
    if (weakCategoryNames.length > 0) {
      const weakCategoryQuizzes = await prisma.quiz.findMany({
        where: {
          category: {
            name: { in: weakCategoryNames },
          },
          isActive: true,
          id: {
            notIn: Array.from(completedQuizIds),
          },
        },
        include: {
          category: { select: { name: true } },
        },
        take: 3,
        orderBy: {
          correctAttempts: 'asc', // 정답률이 낮은 퀴즈 우선
        },
      })
      
      recommendedQuizzes.push(
        ...weakCategoryQuizzes.map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          category: quiz.category.name,
          reason: `취약한 "${quiz.category.name}" 카테고리의 퀴즈입니다`,
        }))
      )
    }
    
    // 2단계: 사용자 레벨에 맞는 일반 추천 퀴즈
    const remainingSlots = 5 - recommendedQuizzes.length
    
    if (remainingSlots > 0) {
      const existingIds = new Set([
        ...completedQuizIds,
        ...recommendedQuizzes.map(q => q.id),
      ])
      
      const generalQuizzes = await prisma.quiz.findMany({
        where: {
          isActive: true,
          id: {
            notIn: Array.from(existingIds),
          },
        },
        include: {
          category: { select: { name: true } },
        },
        take: remainingSlots,
        orderBy: [
          { totalAttempts: 'desc' }, // 인기 있는 퀴즈 우선
          { createdAt: 'desc' }, // 최신 퀴즈 우선
        ],
      })
      
      recommendedQuizzes.push(
        ...generalQuizzes.map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          category: quiz.category.name,
          reason: '새로운 학습 주제를 탐색핸보세요',
        }))
      )
    }
    
    return recommendedQuizzes
  } catch (error) {
    console.error('[Dashboard] Failed to get recommended quizzes:', error)
    return []
  }
}

/**
 * 캐싱된 추천 퀴즈 조회
 */
export const getCachedRecommendedQuizzes = unstable_cache(
  async (userId: string) => getRecommendedQuizzes(userId),
  ['recommended-quizzes'],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: (userId) => [CACHE_TAGS.recommendations(userId)],
  }
)

/**
 * 이어하기 데이터 조회
 * 
 * 사용자가 가장 최근에 시도했지만 완료하지 못한 퀴즈를 조회합니다.
 * 
 * @param userId 사용자 ID
 * @returns ContinueLearning 이어하기 데이터
 * 
 * @example
 * ```typescript
 * const continueData = await getContinueLearning('user-123')
 * if (continueData.hasUnfinished) {
 *   console.log(`이어하기: ${continueData.lastQuizTitle}`)
 * }
 * ```
 */
export async function getContinueLearning(userId: string): Promise<ContinueLearning> {
  try {
    // 가장 최근의 미완료 퀴즈 시도 조회
    // 미완료는 isCorrect가 false인 경우로 정의
    const lastIncorrectAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId,
        isCorrect: false,
      },
      orderBy: {
        attemptDate: 'desc',
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })
    
    if (!lastIncorrectAttempt) {
      return { hasUnfinished: false }
    }
    
    // 해당 퀴즈에 대한 모든 시도 조회 (진행률 계산용)
    const attemptsOnSameQuiz = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quizId: lastIncorrectAttempt.quizId,
      },
      orderBy: {
        attemptDate: 'asc',
      },
    })
    
    // 진행률 계산: 시도 횟수 기반 (최대 3회 기준)
    const maxAttempts = 3
    const currentAttempt = attemptsOnSameQuiz.length
    const progressPercent = Math.min((currentAttempt / maxAttempts) * 100, 100)
    
    return {
      hasUnfinished: true,
      lastQuizId: lastIncorrectAttempt.quiz.id,
      lastQuizTitle: lastIncorrectAttempt.quiz.title,
      progressPercent,
    }
  } catch (error) {
    console.error('[Dashboard] Failed to get continue learning:', error)
    return { hasUnfinished: false }
  }
}

/**
 * 캐싱된 이어하기 데이터 조회
 */
export const getCachedContinueLearning = unstable_cache(
  async (userId: string) => getContinueLearning(userId),
  ['continue-learning'],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: (userId) => [CACHE_TAGS.continueLearning(userId)],
  }
)

// ============================================================================
// Cache Invalidation Helpers
// ============================================================================

/**
 * 대시보드 캐시 무효화
 * 
 * 사용자의 대시보드 데이터가 변경되었을 때 캐시를 무효화합니다.
 * 
 * @param userId 사용자 ID
 */
export async function invalidateDashboardCache(userId: string): Promise<void> {
  const { revalidateTag } = await import('next/cache')
  
  await Promise.all([
    revalidateTag(CACHE_TAGS.stats(userId)),
    revalidateTag(CACHE_TAGS.recommendations(userId)),
    revalidateTag(CACHE_TAGS.continueLearning(userId)),
  ])
}

/**
 * 퀴즈 목록 캐시 무효화
 * 
 * @param level 퀴즈 레벨 (선택적)
 */
export async function invalidateQuizzesCache(level?: QuizLevel): Promise<void> {
  const { revalidateTag } = await import('next/cache')
  
  if (level) {
    await revalidateTag(CACHE_TAGS.quizzes(level))
  } else {
    // 모든 레벨의 캐시 무효화
    await Promise.all([
      revalidateTag(CACHE_TAGS.quizzes('Easy')),
      revalidateTag(CACHE_TAGS.quizzes('Medium')),
      revalidateTag(CACHE_TAGS.quizzes('Hard')),
    ])
  }
}
