/**
 * JWT Validation Utility
 * 
 * 아키텍처 원칙: Single Responsibility
 * - JWT 토큰의 검증만 담당
 * - 토큰 생성/관리는 Better Auth에 위임
 * - 검증 결과를 표준화된 인터페이스로 반환
 */

import { jwtVerify, JWTPayload, JWTVerifyResult } from "jose"
import { AUTH_ERRORS } from "./routes"

/**
 * JWT 검증 결과 인터페이스
 */
export interface JWTValidationResult {
  /** 검증 성공 여부 */
  valid: boolean
  /** 디코딩된 페이로드 */
  payload?: JWTPayload
  /** 에러 메시지 */
  error?: string
  /** 에러 코드 */
  errorCode?: "MISSING" | "INVALID" | "EXPIRED" | "VERIFICATION_FAILED"
}

/**
 * 게스트 세션 검증 결과
 */
export interface GuestSessionValidationResult {
  /** 유효한 게스트 세션 여부 */
  valid: boolean
  /** 게스트 세션 ID */
  sessionId?: string
  /** 남은 시도 횟수 */
  remainingAttempts?: number
  /** 에러 메시지 */
  error?: string
}

/**
 * 게스트 세션 데이터 인터페이스
 */
interface GuestSessionData {
  id: string
  attempts: number
  maxAttempts: number
  createdAt: string
}

/**
 * 환경 변수에서 JWT 시크릿 키 가져오기
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(secret)
}

/**
 * Bearer 토큰 추출
 * 
 * @param authHeader Authorization 헤더 값
 * @returns 추출된 토큰 또는 null
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  const [scheme, token] = authHeader.split(" ")
  
  if (scheme !== "Bearer" || !token) {
    return null
  }
  
  return token
}

/**
 * JWT 토큰 검증
 * 
 * @param token JWT 토큰
 * @returns 검증 결과
 */
export async function verifyJWT(token: string): Promise<JWTValidationResult> {
  try {
    const secret = getJWTSecret()
    const result: JWTVerifyResult = await jwtVerify(token, secret)
    
    return {
      valid: true,
      payload: result.payload,
    }
  } catch (error) {
    if (error instanceof Error) {
      // 에러 타입에 따른 세분화된 처리
      if (error.name === "JWTExpired") {
        return {
          valid: false,
          error: AUTH_ERRORS.EXPIRED_TOKEN,
          errorCode: "EXPIRED",
        }
      }
      
      if (error.name === "JWSSignatureVerificationFailed") {
        return {
          valid: false,
          error: AUTH_ERRORS.INVALID_TOKEN,
          errorCode: "INVALID",
        }
      }
    }
    
    return {
      valid: false,
      error: AUTH_ERRORS.INVALID_TOKEN,
      errorCode: "VERIFICATION_FAILED",
    }
  }
}

/**
 * Authorization 헤더에서 JWT 검증
 * 
 * @param authHeader Authorization 헤더 값
 * @returns 검증 결과
 */
export async function validateAuthHeader(
  authHeader: string | null
): Promise<JWTValidationResult> {
  const token = extractBearerToken(authHeader)
  
  if (!token) {
    return {
      valid: false,
      error: AUTH_ERRORS.MISSING_TOKEN,
      errorCode: "MISSING",
    }
  }
  
  return verifyJWT(token)
}

/**
 * Better Auth 세션 토큰 검증
 * Better Auth는 자체 세션 관리를 사용하므로 쿠키 존재 여부만 확인
 * 실제 세션 검증은 Better Auth가 API 레벨에서 처리
 * 
 * @param sessionToken Better Auth 세션 토큰
 * @returns 검증 결과
 */
export async function verifyBetterAuthSession(
  sessionToken: string | undefined
): Promise<JWTValidationResult> {
  if (!sessionToken) {
    return {
      valid: false,
      error: AUTH_ERRORS.MISSING_TOKEN,
      errorCode: "MISSING",
    }
  }
  
  // Better Auth 세션 쿠키가 존재하면 인증된 것으로 처리
  // 실제 세션 검증은 Better Auth가 API 레벨에서 처리
  // Middleware에서는 쿠키 존재 여부만 확인하여 리다이렉트 결정
  return {
    valid: true,
    payload: {
      sub: "better-auth-session",
      type: "session",
      iat: Math.floor(Date.now() / 1000),
    },
  }
}

/**
 * 게스트 세션 데이터 파싱 및 검증
 * 
 * @param guestDataCookie 게스트 데이터 쿠키 값
 * @returns 검증 결과
 */
export function validateGuestSession(
  guestDataCookie: string | undefined
): GuestSessionValidationResult {
  if (!guestDataCookie) {
    return {
      valid: false,
      error: "게스트 세션이 없습니다",
    }
  }
  
  try {
    const sessionData: GuestSessionData = JSON.parse(
      Buffer.from(guestDataCookie, "base64").toString("utf-8")
    )
    
    // 필수 필드 검증
    if (!sessionData.id || typeof sessionData.attempts !== "number") {
      return {
        valid: false,
        error: "유효하지 않은 게스트 세션 데이터",
      }
    }
    
    // 시도 횟수 초과 검증
    if (sessionData.attempts >= sessionData.maxAttempts) {
      return {
        valid: false,
        sessionId: sessionData.id,
        remainingAttempts: 0,
        error: AUTH_ERRORS.GUEST_LIMIT_EXCEEDED,
      }
    }
    
    return {
      valid: true,
      sessionId: sessionData.id,
      remainingAttempts: sessionData.maxAttempts - sessionData.attempts,
    }
  } catch {
    return {
      valid: false,
      error: "게스트 세션 데이터 파싱 실패",
    }
  }
}

/**
 * 인증 상태 통합 검증
 * 우선순위: JWT 토큰 > Better Auth 세션 > 게스트 세션
 * 
 * @param params 검증에 필요한 파라미터
 * @returns 인증 상태
 */
export async function verifyAuthentication(params: {
  authHeader?: string | null
  sessionToken?: string | undefined
  guestData?: string | undefined
}): Promise<{
  authenticated: boolean
  type: "jwt" | "session" | "guest" | "none"
  payload?: JWTPayload
  guestSessionId?: string
  remainingAttempts?: number
  error?: string
}> {
  // 1. JWT Bearer 토큰 검증 (가장 높은 우선순위)
  if (params.authHeader) {
    const jwtResult = await validateAuthHeader(params.authHeader)
    if (jwtResult.valid) {
      return {
        authenticated: true,
        type: "jwt",
        payload: jwtResult.payload,
      }
    }
  }
  
  // 2. Better Auth 세션 토큰 검증
  if (params.sessionToken) {
    const sessionResult = await verifyBetterAuthSession(params.sessionToken)
    if (sessionResult.valid) {
      return {
        authenticated: true,
        type: "session",
        payload: sessionResult.payload,
      }
    }
  }
  
  // 3. 게스트 세션 검증
  if (params.guestData) {
    const guestResult = validateGuestSession(params.guestData)
    if (guestResult.valid) {
      return {
        authenticated: true,
        type: "guest",
        guestSessionId: guestResult.sessionId,
        remainingAttempts: guestResult.remainingAttempts,
      }
    }
    
    // 게스트 세션은 있지만 유효하지 않은 경우
    return {
      authenticated: false,
      type: "none",
      error: guestResult.error,
    }
  }
  
  // 인증 수단 없음
  return {
    authenticated: false,
    type: "none",
    error: AUTH_ERRORS.MISSING_TOKEN,
  }
}

/**
 * 401 Unauthorized 응답 생성
 */
export function createUnauthorizedResponse(
  error: string,
  wwwAuthenticate?: string
): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  
  if (wwwAuthenticate) {
    headers["WWW-Authenticate"] = wwwAuthenticate
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      error,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 401,
      headers,
    }
  )
}
