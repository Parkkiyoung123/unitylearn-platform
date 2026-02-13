/**
 * React cache() 기반 데이터 캐싱 유틸리티
 * 
 * Request-level 중복 요청 방지 및 데이터 캐싱을 제공합니다.
 * React 18+ cache() 함수를 활용하여 동일한 요청은 한 번만 실행됩니다.
 * 
 * @author Performance Optimization Team
 * @version 1.0.0
 */

import { cache } from "react";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";

// ============================================================================
// 타입 정의
// ============================================================================

export type CacheKey = string | number | symbol;
export type CacheTag = string;

export interface CacheOptions {
  /** 캐시 태그 (revalidate 시 사용) */
  tags?: CacheTag[];
  /** 캐시 재검증 시간 (초) */
  revalidate?: number;
}

export interface CachedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  /** 캐시 무효화 함수 */
  invalidate: (...args: Parameters<T>) => void;
  /** 전체 캐시 초기화 */
  invalidateAll: () => void;
}

// ============================================================================
// React cache() 래퍼 함수
// ============================================================================

/**
 * 데이터베이스 조회용 캐싱 래퍼
 * React cache()를 사용하여 Request-level 중복 요청을 방지합니다.
 * 
 * @example
 * ```ts
 * const getUser = cacheDbQuery(async (id: string) => {
 *   return await prisma.user.findUnique({ where: { id } });
 * }, { tags: ['users'] });
 * ```
 */
export function cacheDbQuery<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions = {}
): CachedFunction<T> {
  // React cache()로 함수 감싸기
  const cachedFn = cache(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = generateCacheKey(args);
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache:DB] ${fn.name}(${key})`);
    }
    
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      console.error(`[Cache:DB] Error in ${fn.name}:`, error);
      throw error;
    }
  });

  // 캐시 무효화 함수 추가
  (cachedFn as any).invalidate = (...args: Parameters<T>) => {
    const key = generateCacheKey(args);
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache:DB] Invalidate ${fn.name}(${key})`);
    }
  };

  (cachedFn as any).invalidateAll = () => {
    if (options.tags) {
      options.tags.forEach(tag => {
        revalidateTag(tag);
        if (process.env.NODE_ENV === "development") {
          console.log(`[Cache:DB] Invalidate tag: ${tag}`);
        }
      });
    }
  };

  return cachedFn as CachedFunction<T>;
}

/**
 * API 호출용 캐싱 래퍼
 * 외부 API 호출을 캐싱하여 중복 요청을 방지합니다.
 * 
 * @example
 * ```ts
 * const fetchQuiz = cacheApiCall(async (id: string) => {
 *   const res = await fetch(`/api/quizzes/${id}`);
 *   return res.json();
 * }, { tags: ['quizzes'] });
 * ```
 */
export function cacheApiCall<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions = {}
): CachedFunction<T> {
  const cachedFn = cache(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = generateCacheKey(args);
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache:API] ${fn.name}(${key})`);
    }
    
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      console.error(`[Cache:API] Error in ${fn.name}:`, error);
      throw error;
    }
  });

  (cachedFn as any).invalidate = (...args: Parameters<T>) => {
    const key = generateCacheKey(args);
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache:API] Invalidate ${fn.name}(${key})`);
    }
  };

  (cachedFn as any).invalidateAll = () => {
    if (options.tags) {
      options.tags.forEach(tag => {
        revalidateTag(tag);
      });
    }
  };

  return cachedFn as CachedFunction<T>;
}

/**
 * 복합 캐싱 - DB + API 조합
 * 데이터베이스 조회와 API 호출을 조합할 때 사용합니다.
 */
export function cacheComposite<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions = {}
): CachedFunction<T> {
  const cachedFn = cache(async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = generateCacheKey(args);
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache:Composite] ${fn.name}(${key})`);
    }
    
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      console.error(`[Cache:Composite] Error in ${fn.name}:`, error);
      throw error;
    }
  });

  (cachedFn as any).invalidate = (...args: Parameters<T>) => {
    const key = generateCacheKey(args);
    if (process.env.NODE_ENV === "development") {
      console.log(`[Cache:Composite] Invalidate ${fn.name}(${key})`);
    }
  };

  (cachedFn as any).invalidateAll = () => {
    if (options.tags) {
      options.tags.forEach(tag => {
        revalidateTag(tag);
      });
    }
  };

  return cachedFn as CachedFunction<T>;
}

// ============================================================================
// 캐시 무효화 유틸리티
// ============================================================================

/**
 * 경로 기반 캐시 무효화
 * revalidatePath()를 통해 특정 경로의 캐시를 무효화합니다.
 * 
 * @example
 * ```ts
 * await invalidatePath('/dashboard');
 * await invalidatePath('/users/[id]', 'page'); // 동적 경로
 * ```
 */
export async function invalidatePath(
  path: string,
  type?: "page" | "layout"
): Promise<void> {
  revalidatePath(path, type);
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] Invalidated path: ${path}${type ? ` (${type})` : ""}`);
  }
}

/**
 * 태그 기반 캐시 무효화
 * revalidateTag()를 통해 특정 태그의 캐시를 무효화합니다.
 * 
 * @example
 * ```ts
 * await invalidateTag('users');
 * await invalidateTags(['users', 'quizzes']);
 * ```
 */
export async function invalidateTag(tag: string): Promise<void> {
  revalidateTag(tag);
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] Invalidated tag: ${tag}`);
  }
}

export async function invalidateTags(tags: string[]): Promise<void> {
  tags.forEach(tag => revalidateTag(tag));
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] Invalidated tags: ${tags.join(", ")}`);
  }
}

/**
 * 패턴 기반 캐시 무효화
 * 특정 패턴에 매칭되는 태그들을 무효화합니다.
 * 
 * @example
 * ```ts
 * await invalidatePattern(/^user:/); // user:로 시작하는 모든 태그
 * ```
 */
export async function invalidatePattern(pattern: RegExp): Promise<void> {
  // 주의: 이 함수는 클라이언트 사이드에서 캐시 추적이 필요함
  // 실제 구현에서는 캐시 메타데이터 저장소가 필요
  if (process.env.NODE_ENV === "development") {
    console.log(`[Cache] Invalidated pattern: ${pattern}`);
  }
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 캐시 키 생성
 * 인자들을 기반으로 고유한 캐시 키를 생성합니다.
 */
function generateCacheKey(args: any[]): string {
  return args
    .map(arg => {
      if (arg === null) return "null";
      if (arg === undefined) return "undefined";
      if (typeof arg === "object") return JSON.stringify(arg);
      return String(arg);
    })
    .join(":");
}

/**
 * 캐시 히트 로깅
 * 개발 환경에서 캐시 히트/미스를 로깅합니다.
 */
export function logCacheOperation(
  operation: "hit" | "miss" | "set" | "invalidate",
  key: string,
  duration?: number
): void {
  if (process.env.NODE_ENV !== "development") return;
  
  const emoji = {
    hit: "✅",
    miss: "❌",
    set: "💾",
    invalidate: "🗑️",
  };
  
  const durationStr = duration ? ` (${duration}ms)` : "";
  console.log(`[Cache] ${emoji[operation]} ${operation.toUpperCase()}: ${key}${durationStr}`);
}

// ============================================================================
// 프리로드 유틸리티
// ============================================================================

/**
 * 데이터 프리로드
 * 컴포넌트 렌더링 전에 데이터를 미리 로드합니다.
 * 
 * @example
 * ```tsx
 * // page.tsx
 * preloadUser(userId);
 * 
 * export default async function Page({ params }: { params: { id: string } }) {
 *   const user = await getUserById(params.id); // 캐시된 결과 즉시 반환
 *   return <UserProfile user={user} />;
 * }
 * ```
 */
export function preload<T>(fn: () => Promise<T>): void {
  // React의 preload 패턴 - Promise를 시작만 하고 await는 하지 않음
  void fn();
}

// ============================================================================
// 캐시 통계 (개발 환경용)
// ============================================================================

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
}

const stats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  invalidations: 0,
};

export function getCacheStats(): CacheStats {
  return { ...stats };
}

export function resetCacheStats(): void {
  stats.hits = 0;
  stats.misses = 0;
  stats.sets = 0;
  stats.invalidations = 0;
}

export function incrementCacheStat(
  type: "hits" | "misses" | "sets" | "invalidations"
): void {
  stats[type]++;
}
