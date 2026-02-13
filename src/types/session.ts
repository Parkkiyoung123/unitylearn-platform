/**
 * Server Session Types
 * 
 * Server Components와 Server Actions에서 사용하는 세션 타입 정의
 * Better Auth 기반의 JWT 세션과 Guest 세션을 모두 지원
 */

/**
 * 사용자 역할
 */
export type UserRole = "user" | "admin" | "guest"

/**
 * 기본 세션 정보 (인증된 사용자 + 게스트)
 */
export interface BaseSession {
  /** 세션 ID */
  id: string
  /** 세션 생성 시간 */
  createdAt: Date
  /** 사용자 역할 */
  role: UserRole
  /** 게스트 세션 여부 */
  isGuest: boolean
}

/**
 * 인증된 사용자 세션 (Better Auth)
 */
export interface AuthenticatedSession extends BaseSession {
  isGuest: false
  /** 사용자 ID */
  userId: string
  /** 사용자 이메일 */
  email: string
  /** 사용자 이름 */
  name?: string
  /** 사용자 이미지 */
  image?: string
  /** 이메일 인증 여부 */
  emailVerified: boolean
  /** 세션 만료 시간 */
  expiresAt: Date
}

/**
 * 게스트 세션
 */
export interface GuestSession extends BaseSession {
  isGuest: true
  /** 최대 시도 횟수 */
  maxAttempts: number
  /** 현재 시도 횟수 */
  attempts: number
  /** 남은 시도 횟수 */
  remainingAttempts: number
  /** 퀴즈 결과 목록 */
  quizResults: GuestQuizResult[]
}

/**
 * 게스트 퀴즈 결과
 */
export interface GuestQuizResult {
  /** 퀴즈 ID */
  quizId: string
  /** 점수 */
  score: number
  /** 완료 시간 */
  completedAt: Date
  /** 레벨 */
  level?: string
}

/**
 * 통합 세션 타입 (Authenticated | Guest)
 */
export type Session = AuthenticatedSession | GuestSession

/**
 * 세션 페이로드 (JWT 디코딩 결과)
 * Better Auth의 세션 토큰 구조
 */
export interface SessionPayload {
  /** 사용자 ID */
  sub: string
  /** 이메일 */
  email: string
  /** 사용자 이름 */
  name?: string
  /** 사용자 이미지 */
  image?: string
  /** 이메일 인증 여부 */
  emailVerified?: boolean
  /** 발급 시간 */
  iat: number
  /** 만료 시간 */
  exp: number
  /** 세션 ID */
  sessionId?: string
}

/**
 * 세션 조회 결과
 */
export interface SessionResult {
  /** 세션 정보 (없으면 null) */
  session: Session | null
  /** 오류 메시지 (실패 시) */
  error?: string
}

/**
 * 인증이 필요한 작업 결과
 */
export interface AuthRequiredResult<T> {
  /** 작업 성공 여부 */
  success: boolean
  /** 작업 결과 데이터 */
  data?: T
  /** 오류 메시지 */
  error?: string
  /** 인증 필요 여부 */
  requiresAuth: boolean
}

/**
 * 세션 쿠키 설정
 */
export interface SessionCookieOptions {
  /** 쿠키 이름 */
  name: string
  /** HttpOnly 설정 */
  httpOnly: boolean
  /** Secure 설정 */
  secure: boolean
  /** SameSite 설정 */
  sameSite: "strict" | "lax" | "none"
  /** 경로 */
  path: string
  /** 최대 만료 시간 (초) */
  maxAge: number
}

/**
 * 세션 검증 결과
 */
export type SessionValidationResult =
  | { valid: true; session: Session }
  | { valid: false; error: string }

/**
 * 세션 업데이트 페이로드
 */
export interface SessionUpdatePayload {
  /** 업데이트할 이름 */
  name?: string
  /** 업데이트할 이미지 */
  image?: string
}
