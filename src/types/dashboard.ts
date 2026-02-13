/**
 * 대시보드 관련 타입 정의
 * 
 * @description UnityLearn 대시보드에서 사용하는 모든 타입을 정의합니다.
 * Prisma Schema의 UserLevel, QuizLevel enum과 동기화되어야 합니다.
 */

// ============================================================================
// Enums (Prisma Schema와 동기화)
// ============================================================================

/**
 * 사용자 레벨 enum
 * Prisma Schema: enum UserLevel
 */
export type UserLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master'

/**
 * 퀴즈 난이도 enum
 * Prisma Schema: enum QuizLevel
 */
export type QuizLevel = 'Easy' | 'Medium' | 'Hard'

/**
 * StatCard 변형 타입
 */
export type StatCardVariant = 'default' | 'success' | 'warning' | 'danger'

// ============================================================================
// Main Dashboard Types
// ============================================================================

/**
 * 대시보드 통계 데이터 타입
 */
export interface DashboardStats {
  currentLevel: UserLevel
  totalAttempts: number
  correctCount: number
  accuracy: number
  streakDays: number
  weeklyProgress: number // 이번 주 푼 문제 수
  weakCategories: string[] // 취약 카테고리 이름 목록
}

/**
 * 레벨별 문제 목록 아이템
 */
export interface LevelQuizItem {
  id: string
  title: string
  category: string
  level: QuizLevel
  isCompleted: boolean
  isLocked: boolean
}

/**
 * 추천 학습 아이템
 */
export interface RecommendedQuiz {
  id: string
  title: string
  category: string
  reason: string // 추천 이유
}

/**
 * 이어하기 데이터
 */
export interface ContinueLearning {
  hasUnfinished: boolean
  lastQuizId?: string
  lastQuizTitle?: string
  progressPercent?: number
}

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * 카테고리별 진행 상황 (UserProgress.categoryProgress JSON 구조)
 */
export interface CategoryProgressData {
  attempts: number
  correct: number
  completed: string[] // 완료한 퀴즈 ID 목록
}

/**
 * 카테고리별 진행 상황 맵
 */
export type CategoryProgressMap = Record<string, CategoryProgressData>

/**
 * 대시보드 쿼리 에러 타입
 */
export interface DashboardQueryError {
  code: 'USER_NOT_FOUND' | 'PROGRESS_NOT_FOUND' | 'DATABASE_ERROR' | 'INVALID_PARAMS'
  message: string
}

/**
 * 레벨 설정 타입
 */
export interface LevelConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
}

// ============================================================================
// Constants
// ============================================================================

/**
 * 레벨 순서 (잠금 상태 계산용)
 */
export const LEVEL_ORDER: Record<QuizLevel, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
}

/**
 * 사용자 레벨 순서
 */
export const USER_LEVEL_ORDER: Record<UserLevel, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
  Master: 5,
}

/**
 * 레벨별 표시 이름
 */
export const LEVEL_DISPLAY_NAMES: Record<QuizLevel, string> = {
  Easy: '초급',
  Medium: '중급',
  Hard: '고급',
}

/**
 * 사용자 레벨 표시 이름
 */
export const USER_LEVEL_DISPLAY_NAMES: Record<UserLevel, string> = {
  Beginner: '입문자',
  Intermediate: '초급자',
  Advanced: '중급자',
  Expert: '고급자',
  Master: '마스터',
}

// ============================================================================
// QuizLevel <-> UserLevel 매핑
// ============================================================================

/**
 * 퀴즈 난이도(QuizLevel)를 사용자 레벨(UserLevel)로 매핑
 */
export function quizLevelToUserLevel(quizLevel: QuizLevel): UserLevel {
  const mapping: Record<QuizLevel, UserLevel> = {
    Easy: 'Beginner',
    Medium: 'Intermediate',
    Hard: 'Advanced',
  }
  return mapping[quizLevel]
}

/**
 * 사용자 레벨(UserLevel)을 퀴즈 난이도(QuizLevel)로 매핑
 * 주의: Expert와 Master는 Hard로 매핑됩니다
 */
export function userLevelToQuizLevel(userLevel: UserLevel): QuizLevel {
  const mapping: Record<UserLevel, QuizLevel> = {
    Beginner: 'Easy',
    Intermediate: 'Medium',
    Advanced: 'Hard',
    Expert: 'Hard',
    Master: 'Hard',
  }
  return mapping[userLevel]
}

// ============================================================================
// LevelBadge 컴포넌트 설정
// ============================================================================

/**
 * 레벨별 설정 - UserLevel용 (사용자 대시보드에서 사용)
 */
export const LEVEL_CONFIG: Record<UserLevel, LevelConfig> = {
  Beginner: {
    label: '초급',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  Intermediate: {
    label: '중급',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  Advanced: {
    label: '고급',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  Expert: {
    label: '전문가',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  Master: {
    label: '마스터',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
  },
}

/**
 * 퀴즈 레벨 설정 - QuizLevel용 (퀴즈 목록에서 사용)
 */
export const QUIZ_LEVEL_CONFIG: Record<QuizLevel, LevelConfig> = {
  Easy: {
    label: '초급',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  Medium: {
    label: '중급',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  Hard: {
    label: '고급',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
}
