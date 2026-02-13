"use client";

/**
 * useAuthenticated Hook
 * 
 * 인증 상태만 확인하는 간편한 React Hook.
 * boolean 플래그만 필요할 때 useSession 대신 사용하세요.
 * 
 * @example
 * ```tsx
 * function ProtectedButton() {
 *   const { isAuthenticated, isLoading } = useAuthenticated();
 *   
 *   if (isLoading) return <Button disabled>Loading...</Button>;
 *   
 *   return (
 *     <Button disabled={!isAuthenticated}>
 *       {isAuthenticated ? "Submit" : "Sign in to continue"}
 *     </Button>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // 게스트와 인증된 사용자 구분
 * function Content() {
 *   const { isSignedIn, isGuest } = useAuthenticated();
 *   
 *   if (isSignedIn) return <FullFeatures />;
 *   if (isGuest) return <LimitedFeatures />;
 *   return <PublicContent />;
 * }
 * ```
 */

import { useMemo } from "react";
import { useSessionContext } from "@/components/providers/SessionProvider";
import type { UseAuthenticatedReturn } from "@/types/auth";

/**
 * 인증 상태만 확인하는 간편한 Hook
 * 
 * @returns 인증 상태 플래그들
 */
export function useAuthenticated(): UseAuthenticatedReturn {
  const { isAuthenticated, isGuest, isLoading } = useSessionContext();

  return useMemo(
    () => ({
      isAuthenticated,
      isGuest,
      isLoading,
      // isSignedIn: 인증되었고 게스트가 아님
      isSignedIn: isAuthenticated && !isGuest,
    }),
    [isAuthenticated, isGuest, isLoading]
  );
}
