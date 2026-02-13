/**
 * Server Session Management for Server Actions
 * 
 * Server Actions에서 사용하는 세션 관리 모듈
 * - Server Component와 동일한 인터페이스 제공
 * - Server Action 특화 에러 처리
 * - redirect()와 통합된 인증 가드
 * 
 * @example
 * ```ts
 * "use server"
 * 
 * import { getSession, requireAuth } from "@/lib/server-actions-session"
 * import { redirect } from "next/navigation"
 * 
 * export async function updateProfile(formData: FormData) {
 *   const session = await requireAuth() // 인증되지 않으면 에러
 *   
 *   // 세션이 보장됨
 *   await db.user.update({
 *     where: { id: session.userId },
 *     data: { name: formData.get("name") }
 *   })
 * }
 * 
 * export async function getCurrentUser() {
 *   const session = await getSession()
 *   
 *   if (!session) {
 *     return null
 *   }
 *   
 *   return {
 *     id: session.isGuest ? session.id : session.userId,
 *     email: session.isGuest ? null : session.email,
 *     isGuest: session.isGuest
 *   }
 * }
 * ```
 */

"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type {
  Session,
  AuthenticatedSession,
  GuestSession,
  SessionPayload,
  GuestQuizResult,
} from "@/types/session"

// ============================================================================
// Re-exports from server-session
// ============================================================================

// Server Component와 동일한 구현을 재사용하지만,
// Server Actions 환경에 맞게 재구성

export type {
  Session,
  AuthenticatedSession,
  GuestSession,
  SessionPayload,
  GuestQuizResult,
} from "@/types/session"

// ============================================================================
// Constants
// ============================================================================

/** Better Auth 세션 쿠키 이름 */
const BETTER_AUTH_SESSION_COOKIE = "better-auth.session_token"

/** 게스트 세션 쿠키 이름 */
const GUEST_SESSION_COOKIE = "guest_session"

/** 게스트 세션 최대 시도 횟수 */
const MAX_GUEST_ATTEMPTS = 5

// ============================================================================
// JWT Utilities (동일한 구현)
// ============================================================================

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const base64Padded = base64 + padding
  
  try {
    return atob(base64Padded)
  } catch {
    throw new Error("Invalid base64 string")
  }
}

function decodeJwt(token: string): SessionPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const payload = base64UrlDecode(parts[1])
    const decoded = JSON.parse(payload) as SessionPayload
    
    return decoded
  } catch (error) {
    console.error("[ServerActionSession] JWT decode error:", error)
    return null
  }
}

function isTokenExpired(exp: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  return exp <= now
}

// ============================================================================
// Guest Session Utilities
// ============================================================================

function parseGuestSession(cookieValue: string): GuestSession | null {
  try {
    const parsed = JSON.parse(cookieValue)
    
    if (!parsed.id || typeof parsed.attempts !== "number") {
      return null
    }

    const attempts = parsed.attempts || 0
    const maxAttempts = parsed.maxAttempts || MAX_GUEST_ATTEMPTS
    
    return {
      id: parsed.id,
      createdAt: new Date(parsed.createdAt || Date.now()),
      role: "guest",
      isGuest: true,
      maxAttempts,
      attempts,
      remainingAttempts: Math.max(0, maxAttempts - attempts),
      quizResults: (parsed.quizResults || []).map((r: GuestQuizResult) => ({
        ...r,
        completedAt: new Date(r.completedAt),
      })),
    }
  } catch {
    return null
  }
}

// ============================================================================
// Core Session Functions
// ============================================================================

/**
 * 세션 가져오기 (Server Actions 전용)
 * 
 * Server Actions에서는 cache()의 이점이 제한적이므로
 * 직접 구현을 사용합니다. (Server Actions는 이미 요청 단위로 실행됨)
 * 
 * @returns 세션 객체 또는 null
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies()

    // 1. 인증된 사용자 세션 확인
    const authToken = cookieStore.get(BETTER_AUTH_SESSION_COOKIE)?.value
    
    if (authToken) {
      const payload = decodeJwt(authToken)
      
      if (payload && !isTokenExpired(payload.exp)) {
        const session: AuthenticatedSession = {
          id: payload.sessionId || payload.sub,
          userId: payload.sub,
          email: payload.email,
          name: payload.name,
          image: payload.image,
          emailVerified: payload.emailVerified || false,
          role: "user",
          isGuest: false,
          createdAt: new Date(payload.iat * 1000),
          expiresAt: new Date(payload.exp * 1000),
        }
        
        return session
      }
    }

    // 2. 게스트 세션 확인
    const guestCookie = cookieStore.get(GUEST_SESSION_COOKIE)?.value
    
    if (guestCookie) {
      const guestSession = parseGuestSession(guestCookie)
      if (guestSession) {
        return guestSession
      }
    }

    return null
  } catch (error) {
    console.error("[ServerActionSession] Error getting session:", error)
    return null
  }
}

/**
 * 인증된 사용자 세션 가져오기
 */
export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  const session = await getSession()
  
  if (session && !session.isGuest) {
    return session as AuthenticatedSession
  }
  
  return null
}

/**
 * 게스트 세션 가져오기
 */
export async function getGuestSession(): Promise<GuestSession | null> {
  const session = await getSession()
  
  if (session?.isGuest) {
    return session as GuestSession
  }
  
  return null
}

// ============================================================================
// Server Action Specific Guards
// ============================================================================

/**
 * 인증 요구 (에러 발생)
 * 
 * 인증되지 않은 경우 AuthError를 발생시킵니다.
 * 클라이언트에서 적절히 처리해야 합니다.
 * 
 * @throws AuthError 인증되지 않은 경우
 * 
 * @example
 * ```ts
 * export async function deleteAccount() {
 *   const session = await requireAuth()
 *   await db.user.delete({ where: { id: session.userId } })
 * }
 * ```
 */
export async function requireAuth(
  errorMessage: string = "인증이 필요합니다"
): Promise<AuthenticatedSession> {
  const session = await getAuthenticatedSession()
  
  if (!session) {
    throw new AuthError(errorMessage)
  }
  
  return session
}

/**
 * 세션 요구 (게스트 포함)
 * 
 * 인증된 사용자나 게스트 세션이 필요한 경우 사용
 * 
 * @throws AuthError 세션이 없는 경우
 */
export async function requireSession(
  errorMessage: string = "세션이 필요합니다"
): Promise<Session> {
  const session = await getSession()
  
  if (!session) {
    throw new AuthError(errorMessage)
  }
  
  return session
}

/**
 * 게스트 거부 (인증된 사용자만)
 * 
 * 게스트 사용자가 접근할 수 없는 기능에서 사용
 * 
 * @throws AuthError 게스트인 경우
 */
export async function requireAuthenticatedUser(
  errorMessage: string = "게스트는 이 기능을 사용할 수 없습니다. 로그인해주세요."
): Promise<AuthenticatedSession> {
  const session = await getSession()
  
  if (!session) {
    throw new AuthError("인증이 필요합니다")
  }
  
  if (session.isGuest) {
    throw new AuthError(errorMessage, "GUEST_NOT_ALLOWED")
  }
  
  return session as AuthenticatedSession
}

/**
 * 인증 리다이렉트
 * 
 * 인증되지 않은 경우 지정된 경로로 리다이렉트합니다.
 * 
 * @example
 * ```ts
 * export async function protectedAction() {
 *   const session = await authOrRedirect("/auth/signin")
 *   // 세션이 보장됨
 * }
 * ```
 */
export async function authOrRedirect(
  redirectTo: string = "/auth/signin"
): Promise<AuthenticatedSession> {
  const session = await getAuthenticatedSession()
  
  if (!session) {
    redirect(redirectTo)
  }
  
  return session
}

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * 인증 관련 에러
 */
export class AuthError extends Error {
  code: string
  
  constructor(message: string, code: string = "UNAUTHORIZED") {
    super(message)
    this.name = "AuthError"
    this.code = code
  }
}

/**
 * 권한 부족 에러
 */
export class ForbiddenError extends AuthError {
  constructor(message: string = "권한이 부족합니다") {
    super(message, "FORBIDDEN")
    this.name = "ForbiddenError"
  }
}

/**
 * 세션 만료 에러
 */
export class SessionExpiredError extends AuthError {
  constructor(message: string = "세션이 만료되었습니다. 다시 로그인해주세요.") {
    super(message, "SESSION_EXPIRED")
    this.name = "SessionExpiredError"
  }
}

// ============================================================================
// Session Checks
// ============================================================================

/**
 * 로그인 여부 확인
 */
export async function isLoggedIn(): Promise<boolean> {
  const session = await getSession()
  return session !== null && !session.isGuest
}

/**
 * 게스트 여부 확인
 */
export async function isGuestUser(): Promise<boolean> {
  const session = await getSession()
  return session?.isGuest ?? false
}

/**
 * 세션 존재 여부 확인
 */
export async function hasSession(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

// ============================================================================
// Helper Functions for Common Patterns
// ============================================================================

/**
 * 세션 기반 사용자 ID 가져오기
 * 
 * 인증된 사용자: userId 반환
 * 게스트: guest session id 반환
 * 없음: null 반환
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  return session.isGuest ? session.id : session.userId
}

/**
 * 세션 기반 이메일 가져오기
 * 
 * 인증된 사용자: email 반환
 * 게스트: null 반환
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const session = await getSession()
  
  if (!session || session.isGuest) {
    return null
  }
  
  return session.email
}

/**
 * 사용자 식별자 (디스플레이용)
 * 
 * 이름 > 이메일 > "게스트" > "Unknown" 순으로 반환
 */
export async function getCurrentUserDisplayName(): Promise<string> {
  const session = await getSession()
  
  if (!session) {
    return "Unknown"
  }
  
  if (session.isGuest) {
    return "게스트"
  }
  
  return session.name || session.email || "Unknown"
}

// ============================================================================
// Form Action Helpers
// ============================================================================

/**
 * 인증된 Form Action 래퍼
 * 
 * @example
 * ```ts
 * export const updateProfile = withAuthFormAction(
 *   async (session, formData) => {
 *     const name = formData.get("name")
 *     await db.user.update({ where: { id: session.userId }, data: { name } })
 *     return { success: true }
 *   }
 * )
 * ```
 */
export function withAuthFormAction<
  T extends Record<string, unknown>
>(
  handler: (session: AuthenticatedSession, formData: FormData) => Promise<T>
): (formData: FormData) => Promise<T | { error: string }> {
  return async (formData: FormData) => {
    try {
      const session = await requireAuth()
      return await handler(session, formData)
    } catch (error) {
      if (error instanceof AuthError) {
        return { error: error.message }
      }
      throw error
    }
  }
}

/**
 * 세션 기반 Form Action 래퍼 (게스트 포함)
 */
export function withSessionFormAction<
  T extends Record<string, unknown>
>(
  handler: (session: Session, formData: FormData) => Promise<T>
): (formData: FormData) => Promise<T | { error: string }> {
  return async (formData: FormData) => {
    try {
      const session = await requireSession()
      return await handler(session, formData)
    } catch (error) {
      if (error instanceof AuthError) {
        return { error: error.message }
      }
      throw error
    }
  }
}
