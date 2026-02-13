/**
 * Authentication Types
 * 
 * 사용자 세션 및 인증 관련 타입 정의
 */

import { User } from "better-auth"

/**
 * 세션 상태 타입
 */
export interface SessionState {
  /** 현재 사용자 정보 */
  user: User | null
  /** 세션 로딩 중 여부 */
  isLoading: boolean
  /** 인증된 사용자 여부 */
  isAuthenticated: boolean
  /** 게스트 사용자 여부 */
  isGuest: boolean
  /** 세션 에러 */
  error: Error | null
}

/**
 * 세션 컨텍스트 값 타입
 */
export interface SessionContextValue extends SessionState {
  /** 세션 새로고침 */
  refreshSession: () => Promise<void>
  /** 세션 종료 */
  signOut: () => Promise<void>
}

/**
 * API 세션 응답 타입
 */
export interface SessionResponse {
  user: User | null
  session: {
    id: string
    expiresAt: string
    createdAt: string
    updatedAt: string
    userId: string
  } | null
}

/**
 * Broadcast Channel 메시지 타입
 */
export type BroadcastMessage =
  | { type: "SESSION_UPDATED"; payload: { user: User | null } }
  | { type: "SESSION_CLEARED" }
  | { type: "SESSION_REFRESH_REQUEST" }

/**
 * 세션 Provider Props
 */
export interface SessionProviderProps {
  children: React.ReactNode
  /** 초기 세션 데이터 (SSR 시 사용) */
  initialSession?: SessionResponse | null
  /** 세션 새로고침 간격 (ms), 0이면 비활성화 */
  refetchInterval?: number
  /** 세션 만료 시 자동 로그아웃 */
  signOutOnSessionExpire?: boolean
}

/**
 * useSession 훅 반환 타입
 */
export interface UseSessionReturn extends SessionState {
  /** 세션 새로고침 */
  refresh: () => Promise<void>
  /** 세션 종료 */
  signOut: () => Promise<void>
  /** 상태 업데이트 (날짜: 낙관적 업데이트용) */
  update: (data: Partial<SessionState>) => void
}

/**
 * useAuthenticated 훅 반환 타입
 */
export interface UseAuthenticatedReturn {
  /** 인증 상태 */
  isAuthenticated: boolean
  /** 게스트 상태 */
  isGuest: boolean
  /** 로딩 상태 */
  isLoading: boolean
  /** 인증된 사용자인지 확인 (게스트 제외) */
  isSignedIn: boolean
}
