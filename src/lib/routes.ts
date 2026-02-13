/**
 * Route Configuration
 * 
 * 아키텍처 원칙: Configuration over Code
 * - 라우트 접근 제어 정책을 중앙 집중식으로 관리
 * - 새로운 라우트 추가 시 이 파일만 수정
 * - 정책 변경 시 일관된 적용 가능
 */

/**
 * 공개 라우트 - 인증 없이 접근 가능
 */
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/about",
  "/auth/signin",
  "/auth/signup",
  "/auth/reset-password",
  "/api/auth/",
] as const

/**
 * 인증 필요 라우트 - 유효한 JWT 토큰 필수
 */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/api/protected/",
] as const

/**
 * 게스트 허용 라우트 - 인증 또는 게스트 세션으로 접근 가능
 * - 진단 테스트 및 미리보기 문제 접근용
 */
export const GUEST_ALLOWED_ROUTES = [
  "/quiz/",
  "/diagnostic",
  "/api/quiz/preview",
] as const

/**
 * 게스트 전용 접근 가능한 퀴즈 경로 패턴
 * - 진단 테스트: /quiz/diagnostic/*
 * - 미리보기 문제: /quiz/preview/*
 */
export const GUEST_ACCESSIBLE_PATTERNS = [
  "/quiz/diagnostic",
  "/quiz/preview",
] as const

/**
 * 라우트 매처 유틸리티
 */
export const routeMatcher = {
  /**
   * 경로가 주어진 라우트 목록 중 하나와 일치하는지 확인
   */
  matches(pathname: string, routes: readonly string[]): boolean {
    return routes.some((route) => 
      pathname === route || pathname.startsWith(route)
    )
  },

  /**
   * 공개 라우트 여부 확인
   */
  isPublic(pathname: string): boolean {
    return this.matches(pathname, PUBLIC_ROUTES)
  },

  /**
   * 보호된 라우트 여부 확인
   */
  isProtected(pathname: string): boolean {
    return this.matches(pathname, PROTECTED_ROUTES)
  },

  /**
   * 게스트 허용 라우트 여부 확인
   */
  isGuestAllowed(pathname: string): boolean {
    return this.matches(pathname, GUEST_ALLOWED_ROUTES)
  },

  /**
   * 게스트가 접근 가능한 특정 패턴인지 확인
   */
  isGuestAccessiblePattern(pathname: string): boolean {
    return GUEST_ACCESSIBLE_PATTERNS.some((pattern) =>
      pathname === pattern || pathname.startsWith(`${pattern}/`)
    )
  },
}

/**
 * 쿠키 이름 상수
 */
export const COOKIE_NAMES = {
  /**
   * Better Auth 세션 토큰
   */
  AUTH_SESSION: "better-auth.session_token",
  
  /**
   * 게스트 세션 ID
   */
  GUEST_SESSION: "unitylearn_guest_session_id",
  
  /**
   * 게스트 세션 데이터 (서버 사이드 검증용)
   */
  GUEST_DATA: "unitylearn_guest_data",
} as const

/**
 * HTTP 헤더 상수
 */
export const HEADERS = {
  AUTHORIZATION: "authorization",
  CONTENT_TYPE: "content-type",
  WWW_AUTHENTICATE: "www-authenticate",
} as const

/**
 * 에러 응답 메시지
 */
export const AUTH_ERRORS = {
  MISSING_TOKEN: "인증 토큰이 필요합니다",
  INVALID_TOKEN: "유효하지 않은 인증 토큰입니다",
  EXPIRED_TOKEN: "인증 토큰이 만료되었습니다",
  INSUFFICIENT_PERMISSIONS: "접근 권한이 부족합니다",
  GUEST_LIMIT_EXCEEDED: "게스트 시도 횟수를 초과했습니다",
} as const
