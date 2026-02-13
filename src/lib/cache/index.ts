/**
 * Cache Module - React cache() 기반 데이터 캐싱
 * 
 * @example
 * ```tsx
 * import { getUserById, preloadUser } from '@/lib/cache';
 * 
 * // 프리로드
 * preloadUser(userId);
 * 
 * // 사용
 * const user = await getUserById(userId);
 * ```
 */

// 데이터 캐싱 유틸리티
export {
  cacheDbQuery,
  cacheApiCall,
  cacheComposite,
  invalidatePath,
  invalidateTag,
  invalidateTags,
  invalidatePattern,
  logCacheOperation,
  preload,
  getCacheStats,
  resetCacheStats,
  incrementCacheStat,
} from "./data-cache";

// 캐싱된 쿼리 함수들
export {
  // 사용자
  getUserById,
  getUserByEmail,
  getGuestUser,
  getUserQuizAttempts,
  
  // 퀴즈
  getQuizById,
  getQuizzes,
  
  // 카테고리
  getCategories,
  getCategoryBySlug,
  
  // 퀴즈 시도
  getQuizAttemptById,
  getGuestQuizAttempt,
  
  // 통계
  getUserStats,
  
  // 캐시 무효화
  invalidateUserCache,
  invalidateQuizCache,
  invalidateCategoryCache,
  invalidateQuizAttemptCache,
  
  // 프리로드
  preloadUser,
  preloadQuiz,
  preloadCategories,
  preloadUserStats,
} from "./queries";

// 타입 재남성
export type {
  CacheKey,
  CacheTag,
  CacheOptions,
  CachedFunction,
} from "./data-cache";

export type {
  Quiz,
  QuizQuestion,
  Category,
  UserStats,
} from "./queries";
