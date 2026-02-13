/**
 * 캐싱된 데이터 조회 함수들
 * 
 * React cache()를 활용하여 중복 데이터 요청을 방지합니다.
 * 모든 함수는 Request-level 캐싱을 제공합니다.
 * 
 * @author Performance Optimization Team
 * @version 1.0.0
 */

import { cache } from "react";
import { prisma } from "@/lib/db";
import { 
  cacheDbQuery, 
  cacheApiCall, 
  cacheComposite,
  invalidateTag,
  invalidatePath
} from "./data-cache";
import type { User, QuizAttempt, GuestQuizAttempt } from "@prisma/client";

// ============================================================================
// 사용자 관련 쿼리
// ============================================================================

/**
 * 사용자 ID로 조회 (캐싱됨)
 * 
 * @example
 * ```tsx
 * // 동일한 요청 내에서 여러 컴포넌트가 호출핤도 1번만 DB 조회
 * const user = await getUserById(userId);
 * ```
 */
export const getUserById = cacheDbQuery(
  async (id: string): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        quizAttempts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  },
  { tags: ["users"] }
);

/**
 * 이메일로 사용자 조회 (캐싱됨)
 */
export const getUserByEmail = cacheDbQuery(
  async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { email },
    });
  },
  { tags: ["users"] }
);

/**
 * 게스트 사용자 조회 (캐싱됨)
 */
export const getGuestUser = cacheDbQuery(
  async (guestId: string): Promise<User | null> => {
    return await prisma.user.findFirst({
      where: { 
        id: guestId,
        isGuest: true 
      },
    });
  },
  { tags: ["users", "guests"] }
);

/**
 * 사용자의 퀴즈 시도 기록 조회 (캐싱됨)
 */
export const getUserQuizAttempts = cacheDbQuery(
  async (userId: string): Promise<QuizAttempt[]> => {
    return await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
  { tags: ["quiz-attempts", "users"] }
);

// ============================================================================
// 퀴즈 관련 쿼리
// ============================================================================

// 퀴즈 인터페이스 (외부 API 또는 남성 데이터 소스)
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

/**
 * 퀴즈 ID로 조회 (캐싱됨)
 * 외부 API 또는 데이터베이스에서 퀴즈를 조회합니다.
 * 
 * @example
 * ```tsx
 * const quiz = await getQuizById(quizId);
 * ```
 */
export const getQuizById = cacheApiCall(
  async (id: string): Promise<Quiz | null> => {
    // 1. 외부 API 호출
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
    const response = await fetch(`${apiBaseUrl}/quizzes/${id}`, {
      next: { 
        revalidate: 3600, // 1시간 캐싱
        tags: [`quiz:${id}`, "quizzes"] 
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz: ${response.statusText}`);
    }

    return response.json();
  },
  { tags: ["quizzes"] }
);

/**
 * 퀴즈 목록 조회 (캐싱됨)
 * 
 * @example
 * ```tsx
 * const quizzes = await getQuizzes({ category: 'javascript', limit: 10 });
 * ```
 */
export const getQuizzes = cacheApiCall(
  async (options: {
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
    limit?: number;
    offset?: number;
  } = {}): Promise<Quiz[]> => {
    const { category, difficulty, limit = 20, offset = 0 } = options;
    
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);
    params.append("limit", String(limit));
    params.append("offset", String(offset));

    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
    const response = await fetch(
      `${apiBaseUrl}/quizzes?${params}`,
      {
        next: { 
          revalidate: 300, // 5분 캐싱
          tags: ["quizzes"] 
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quizzes: ${response.statusText}`);
    }

    return response.json();
  },
  { tags: ["quizzes"] }
);

// ============================================================================
// 카테고리 관련 쿼리
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  quizCount: number;
}

/**
 * 모든 카테고리 조회 (캐싱됨)
 * 자주 변경되지 않는 데이터로 장기간 캐싱됩니다.
 * 
 * @example
 * ```tsx
 * const categories = await getCategories();
 * ```
 */
export const getCategories = cacheComposite(
  async (): Promise<Category[]> => {
    // 1. DB에서 카테고리 통계 조회 (SQLite compatible)
    const categoryStats = await prisma.$queryRaw<{ quizId: string; count: bigint }[]>`
      SELECT quizId, COUNT(*) as count 
      FROM QuizAttempt 
      GROUP BY quizId
    `;

    // 2. API에서 카테고리 메타데이터 조회
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
    const response = await fetch(
      `${apiBaseUrl}/categories`,
      {
        next: { 
          revalidate: 86400, // 24시간 캐싱
          tags: ["categories"] 
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const categories: Category[] = await response.json();
    
    // 통계 데이터 병합
    return categories.map(cat => ({
      ...cat,
      quizCount: Number(
        (categoryStats as Array<{ quizId: string; count: bigint }>).find(
          (s: { quizId: string }) => s.quizId === cat.id
        )?.count || 0
      ),
    }));
  },
  { tags: ["categories", "quizzes"] }
);

/**
 * 단일 카테고리 조회 (캐싱됨)
 */
export const getCategoryBySlug = cacheApiCall(
  async (slug: string): Promise<Category | null> => {
    const categories = await getCategories();
    return categories.find(c => c.slug === slug) || null;
  },
  { tags: ["categories"] }
);

// ============================================================================
// 퀴즈 시도 관련 쿼리
// ============================================================================

/**
 * 특정 퀴즈 시도 조회 (캐싱됨)
 */
export const getQuizAttemptById = cacheDbQuery(
  async (attemptId: string): Promise<QuizAttempt | null> => {
    return await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
    });
  },
  { tags: ["quiz-attempts"] }
);

/**
 * 게스트 퀴즈 시도 조회 (캐싱됨)
 */
export const getGuestQuizAttempt = cacheDbQuery(
  async (guestId: string): Promise<GuestQuizAttempt | null> => {
    return await prisma.guestQuizAttempt.findUnique({
      where: { guestId },
    });
  },
  { tags: ["quiz-attempts", "guests"] }
);

// ============================================================================
// 대시보드/통계 쿼리
// ============================================================================

export interface UserStats {
  totalAttempts: number;
  completedQuizzes: number;
  averageScore: number;
  bestScore: number;
  recentAttempts: QuizAttempt[];
}

/**
 * 사용자 통계 조회 (캐싱됨)
 */
export const getUserStats = cacheDbQuery(
  async (userId: string): Promise<UserStats> => {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const completed = attempts.filter(a => a.completed);
    const scores = completed.map(a => a.score);

    return {
      totalAttempts: attempts.length,
      completedQuizzes: completed.length,
      averageScore: scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      recentAttempts: attempts.slice(0, 5),
    };
  },
  { tags: ["users", "quiz-attempts"] }
);

// ============================================================================
// 캐시 무효화 헬퍼 함수들
// ============================================================================

/**
 * 사용자 캐시 무효화
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await invalidateTag("users");
  await invalidatePath(`/users/${userId}`);
  await invalidatePath("/dashboard");
}

/**
 * 퀴즈 캐시 무효화
 */
export async function invalidateQuizCache(quizId: string): Promise<void> {
  await invalidateTag("quizzes");
  await invalidateTag(`quiz:${quizId}`);
  await invalidatePath(`/quizzes/${quizId}`);
}

/**
 * 카테고리 캐시 무효화
 */
export async function invalidateCategoryCache(): Promise<void> {
  await invalidateTag("categories");
  await invalidatePath("/categories");
}

/**
 * 퀴즈 시도 캐시 무효화
 */
export async function invalidateQuizAttemptCache(
  userId: string
): Promise<void> {
  await invalidateTag("quiz-attempts");
  await invalidatePath(`/users/${userId}/attempts`);
  await invalidatePath("/dashboard");
}

// ============================================================================
// 프리로드 함수들
// ============================================================================

/**
 * 사용자 데이터 프리로드
 * 
 * @example
 * ```tsx
 * // layout.tsx 또는 page.tsx에서 호출
 * preloadUser(userId);
 * 
 * export default async function Page() {
 *   const user = await getUserById(userId); // 즉시 반환
 *   return <UserProfile user={user} />;
 * }
 * ```
 */
export function preloadUser(userId: string): void {
  void getUserById(userId);
}

/**
 * 퀴즈 데이터 프리로드
 */
export function preloadQuiz(quizId: string): void {
  void getQuizById(quizId);
}

/**
 * 카테고리 데이터 프리로드
 */
export function preloadCategories(): void {
  void getCategories();
}

/**
 * 사용자 통계 프리로드
 */
export function preloadUserStats(userId: string): void {
  void getUserStats(userId);
}
