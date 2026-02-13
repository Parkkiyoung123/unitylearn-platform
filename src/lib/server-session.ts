/**
 * Server Session Management for Server Components
 * 
 * Server Components에서 사용하는 세션 관리 모듈
 * - React cache()를 사용한 Request-level 캐싱
 * - JWT 디코딩 (검증은 Middleware에서 이미 수행)
 * - Guest 세션과 인증된 세션 모두 지원
 * 
 * @example
 * ```tsx
 * import { getSession } from "@/lib/server-session"
 * 
 * export default async function Page() {
 *   const session = await getSession()
 *   
 *   if (!session) {
 *     return <div>로그인이 필요합니다</div>
 *   }
 *   
 *   return <div>안녕하세요, {session.isGuest ? "게스트" : session.email}님</div>
 * }
 * ```
 */

import { cookies } from "next/headers"
import { cache } from "react"
import type {
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

/** 개발 모드 세션 쿠키 이름 */
const DEV_SESSION_COOKIE = "dev_session"

/** 게스트 세션 최대 시도 횟수 */
const MAX_GUEST_ATTEMPTS = 5

// 개발용 테스트 사용자 정보
const DEV_USER = {
  id: 'c3a1585f-d4a8-42e2-b88e-18b4d1bf0577',
  email: 'demo@unitylearn.com',
  name: '데모 사용자',
  level: 'Intermediate' as const,
}

// ============================================================================
// JWT Utilities
// ============================================================================

/**
 * Base64Url 디코딩
 */
function base64UrlDecode(str: string): string {
  // Base64Url -> Base64 변환
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  // 패딩 추가
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const base64Padded = base64 + padding
  
  try {
    return atob(base64Padded)
  } catch {
    throw new Error("Invalid base64 string")
  }
}

/**
 * JWT 페이로드 디코딩 (서명 검증 없음)
 * Middleware에서 이미 검증되었다고 가정
 */
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
    console.error("[ServerSession] JWT decode error:", error)
    return null
  }
}

/**
 * JWT 만료 여부 확인
 */
function isTokenExpired(exp: number): boolean {
  const now = Math.floor(Date.now() / 1000)
  return exp <= now
}

// ============================================================================
// Guest Session Utilities
// ============================================================================

/**
 * 게스트 세션 파싱
 */
function parseGuestSession(cookieValue: string): GuestSession | null {
  try {
    const parsed = JSON.parse(cookieValue)
    
    // 기본 유효성 검사
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
 * 원시 세션 가져오기 (캐싱 없음)
 * 낮은 수준의 세션 조회 - 직접 사용하지 말고 getSession 사용
 */
async function getSessionUncached(): Promise<Session | null> {
  try {
    const cookieStore = cookies()

    // 1. 인증된 사용자 세션 확인 (Better Auth)
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
          role: "user", // Better Auth에서 role 클레임을 추가할 수 있음
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

    // 3. 개발 모드: dev_session 쿠키 확인
    if (process.env.NODE_ENV === 'development') {
      const devCookie = cookieStore.get(DEV_SESSION_COOKIE)?.value
      
      if (devCookie === DEV_USER.email) {
        console.log(`[ServerSession] Development mode - returning dev user session for ${DEV_USER.email}`)
        
        const devSession: AuthenticatedSession = {
          id: `dev-session-${Date.now()}`,
          userId: DEV_USER.id,
          email: DEV_USER.email,
          name: DEV_USER.name,
          emailVerified: true,
          role: "user",
          isGuest: false,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
        
        return devSession
      }
    }

    // 세션 없음
    return null
  } catch (error) {
    console.error("[ServerSession] Error getting session:", error)
    return null
  }
}

/**
 * 세션 가져오기 (Request-level 캐싱 적용)
 * 
 * React cache()를 사용하여 동일 요청 내에서 중복 세션 조회를 방지합니다.
 * Server Component에서 사용할 때 매우 효율적입니다.
 * 
 * @returns 세션 객체 또는 null
 * 
 * @example
 * ```tsx
 * // 동일한 요청 내에서 여러 번 호출핵도 한 번만 조회됨
 * const session = await getSession()
 * ```
 */
export const getSession = cache(getSessionUncached)

/**
 * 인증된 사용자 세션 가져오기
 * 
 * 게스트 세션은 제외하고 인증된 사용자만 반환합니다.
 * 
 * @returns 인증된 세션 또는 null
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
 * 
 * @returns 게스트 세션 또는 null
 */
export async function getGuestServerSession(): Promise<GuestSession | null> {
  const session = await getSession()
  
  if (session?.isGuest) {
    return session as GuestSession
  }
  
  return null
}

// ============================================================================
// Session Guards
// ============================================================================

/**
 * 세션 필요한 작업 래퍼
 * 
 * 세션이 없을 경우 기본값을 반환하거나 에러를 발생시킵니다.
 * 
 * @example
 * ```tsx
 * const userData = await withSession(
 *   (session) => fetchUserData(session.userId),
 *   { errorMessage: "로그인이 필요합니다" }
 * )
 * ```
 */
export async function withSession<T>(
  fn: (session: Session) => Promise<T>,
  options: {
    errorMessage?: string
    allowGuest?: boolean
  } = {}
): Promise<T> {
  const { errorMessage = "세션이 필요합니다", allowGuest = true } = options
  
  const session = await getSession()
  
  if (!session) {
    throw new Error(errorMessage)
  }
  
  if (!allowGuest && session.isGuest) {
    throw new Error("게스트는 이 기능을 사용할 수 없습니다")
  }
  
  return fn(session)
}

/**
 * 인증된 사용자만 접근 가능한 작업 래퍼
 * 
 * @example
 * ```tsx
 * const userData = await withAuthenticatedSession(
 *   (session) => fetchUserData(session.userId)
 * )
 * ```
 */
export async function withAuthenticatedSession<T>(
  fn: (session: AuthenticatedSession) => Promise<T>,
  errorMessage: string = "로그인이 필요합니다"
): Promise<T> {
  const session = await getAuthenticatedSession()
  
  if (!session) {
    throw new Error(errorMessage)
  }
  
  return fn(session)
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
 * 세션 존재 여부 확인 (인증된 사용자 + 게스트)
 */
export async function hasSession(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

// ============================================================================
// Debug Utilities (Development Only)
// ============================================================================

/**
 * 세션 디버그 정보 (개발 환경에서만 사용)
 */
export async function getSessionDebugInfo(): Promise<{
  hasSession: boolean
  isGuest: boolean
  userId?: string
  email?: string
  expiresAt?: string
} | null> {
  if (process.env.NODE_ENV === "production") {
    return null
  }

  const session = await getSession()
  
  if (!session) {
    return { hasSession: false, isGuest: false }
  }
  
  if (session.isGuest) {
    return {
      hasSession: true,
      isGuest: true,
      userId: session.id,
    }
  }
  
  return {
    hasSession: true,
    isGuest: false,
    userId: session.userId,
    email: session.email,
    expiresAt: session.expiresAt.toISOString(),
  }
}
