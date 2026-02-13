"use client";

/**
 * useSession Hook
 * 
 * 전역 세션 상태에 접근하는 React Hook.
 * SessionProvider 낸에서 사용해야 합니다.
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, isLoading, isAuthenticated, refresh } = useSession();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <SignInPrompt />;
 *   
 *   return <div>Hello, {user.name}!</div>;
 * }
 * ```
 */

import { useCallback, useMemo } from "react";
import { useSessionContext } from "@/components/providers/SessionProvider";
import type { UseSessionReturn, SessionState } from "@/types/auth";

/**
 * 세션 상태에 접근하는 Hook
 * 
 * @returns 세션 상태 및 제어 함수
 */
export function useSession(): UseSessionReturn {
  const context = useSessionContext();

  // 낙관적 업데이트를 위한 update 함수
  const update = useCallback((data: Partial<SessionState>) => {
    // Context 낸부에서 제공되지 않으므로 no-op
    // 필요시 SessionProvider에 dispatch 노출 필요
    console.warn("[useSession] update is not implemented yet");
  }, []);

  return useMemo(
    () => ({
      user: context.user,
      isLoading: context.isLoading,
      isAuthenticated: context.isAuthenticated,
      isGuest: context.isGuest,
      error: context.error,
      refresh: context.refreshSession,
      signOut: context.signOut,
      update,
    }),
    [
      context.user,
      context.isLoading,
      context.isAuthenticated,
      context.isGuest,
      context.error,
      context.refreshSession,
      context.signOut,
      update,
    ]
  );
}
