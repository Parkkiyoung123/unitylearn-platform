"use client";

/**
 * SessionProvider
 * 
 * 전역 세션 상태 관리 및 탭 간 동기화를 제공하는 React Context Provider.
 * 
 * Architecture:
 * - Context API로 상태 제공
 * - BroadcastChannel API로 탭 간 동기화
 * - Better Auth의 useSession 훅 사용
 * 
 * @example
 * ```tsx
 * // layout.tsx
 * <SessionProvider>
 *   {children}
 * </SessionProvider>
 * ```
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useMemo,
} from "react";
import type { User } from "better-auth";
import { useSession as useBetterAuthSession } from "@/lib/auth-client";
import {
  SessionContextValue,
  SessionProviderProps,
  BroadcastMessage,
} from "@/types/auth";

// =============================================================================
// Constants
// =============================================================================

const BROADCAST_CHANNEL_NAME = "unitylearn_session_sync";

// =============================================================================
// State & Actions
// =============================================================================

type SessionAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SESSION"; payload: { user: User | null } }
  | { type: "SET_ERROR"; payload: Error }
  | { type: "CLEAR_SESSION" }
  | { type: "UPDATE_STATE"; payload: Partial<Omit<SessionContextValue, "refreshSession" | "signOut">> };

interface SessionState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  error: Error | null;
}

const initialState: SessionState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,
  error: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    
    case "SET_SESSION": {
      const { user } = action.payload;
      return {
        ...state,
        user,
        isAuthenticated: !!user,
        isGuest: !user,
        isLoading: false,
        error: null,
      };
    }
    
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case "CLEAR_SESSION":
      return {
        ...initialState,
        isLoading: false,
      };
    
    case "UPDATE_STATE":
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

// =============================================================================
// Context
// =============================================================================

const SessionContext = createContext<SessionContextValue | null>(null);

// =============================================================================
// Provider Component
// =============================================================================

export function SessionProvider({
  children,
  initialSession = null,
  // Better Auth의 useSession이 자동으로 세션을 갱신하므로 refetchInterval은 사용하지 않음
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  refetchInterval: _refetchInterval = 0,
  signOutOnSessionExpire = true,
}: SessionProviderProps) {
  // Better Auth의 useSession 훅 사용
  const { data: betterAuthSession, isPending, error: betterAuthError } = useBetterAuthSession();

  const [state, dispatch] = useReducer(sessionReducer, {
    ...initialState,
    // SSR 초기 데이터가 있으면 적용
    ...(initialSession?.user && {
      user: initialSession.user,
      isAuthenticated: true,
      isGuest: false,
      isLoading: false,
    }),
  });

  // BroadcastChannel ref - 탭 간 통신용
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // =============================================================================
  // Sync Better Auth Session to Local State
  // =============================================================================

  useEffect(() => {
    if (isPending) {
      dispatch({ type: "SET_LOADING", payload: true });
      return;
    }

    if (betterAuthError) {
      dispatch({
        type: "SET_ERROR",
        payload: betterAuthError instanceof Error ? betterAuthError : new Error("Session error"),
      });
      return;
    }

    if (betterAuthSession?.user) {
      dispatch({ type: "SET_SESSION", payload: { user: betterAuthSession.user } });
      
      // 다른 탭에 세션 업데이트 알림
      broadcastChannelRef.current?.postMessage({
        type: "SESSION_UPDATED",
        payload: { user: betterAuthSession.user },
      } as BroadcastMessage);
    } else {
      dispatch({ type: "CLEAR_SESSION" });
      
      // 다른 탭에 세션 클리어 알림
      broadcastChannelRef.current?.postMessage({
        type: "SESSION_CLEARED",
      } as BroadcastMessage);
    }
  }, [betterAuthSession, isPending, betterAuthError]);

  // =============================================================================
  // Session Actions
  // =============================================================================

  const refreshSession = useCallback(async () => {
    // Better Auth의 useSession은 자동으로 세션을 관리하므로
    // 수동 새로고침은 불필요. 하지만 API 호출 실패 시 재시도 로직은 유지.
    dispatch({ type: "SET_LOADING", payload: true });
    
    // 페이지 새로고침으로 Better Auth 세션 갱신 유도
    window.location.reload();
  }, []);

  const signOut = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Sign out failed");
      }

      dispatch({ type: "CLEAR_SESSION" });
      
      // 다른 탭에 로그아웃 알림
      broadcastChannelRef.current?.postMessage({
        type: "SESSION_CLEARED",
      } as BroadcastMessage);
      
      // 선택적: 로그인 페이지로 리다이렉트
      window.location.href = "/auth/signin";
    } catch (error) {
      console.error("[SessionProvider] Sign out failed:", error);
      throw error;
    }
  }, []);

  // =============================================================================
  // BroadcastChannel Setup (Tab Sync)
  // =============================================================================

  useEffect(() => {
    // BroadcastChannel 지원 확인
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannelRef.current = channel;

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      const message = event.data;

      switch (message.type) {
        case "SESSION_UPDATED":
          // 다른 탭에서 세션이 업데이트됨
          dispatch({
            type: "SET_SESSION",
            payload: { user: message.payload.user },
          });
          break;

        case "SESSION_CLEARED":
          // 다른 탭에서 로그아웃됨
          dispatch({ type: "CLEAR_SESSION" });
          
          if (signOutOnSessionExpire) {
            // 현재 페이지 새로고침 또는 리다이렉트
            window.location.reload();
          }
          break;

        case "SESSION_REFRESH_REQUEST":
          // 다른 탭에서 새로고침 요청 - 현재 세션 상태 반환
          if (state.user) {
            channel.postMessage({
              type: "SESSION_UPDATED",
              payload: { user: state.user },
            } as BroadcastMessage);
          }
          break;
      }
    };

    return () => {
      channel.close();
      broadcastChannelRef.current = null;
    };
  }, [state.user, signOutOnSessionExpire]);

  // =============================================================================
  // Visibility Change Handler (Tab Focus)
  // =============================================================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // 탭이 다시 활성화될 때 세션 새로고침 요청
        broadcastChannelRef.current?.postMessage({
          type: "SESSION_REFRESH_REQUEST",
        } as BroadcastMessage);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // =============================================================================
  // Context Value (Memoized)
  // =============================================================================

  const contextValue = useMemo<SessionContextValue>(
    () => ({
      ...state,
      refreshSession,
      signOut,
    }),
    [state, refreshSession, signOut]
  );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// =============================================================================
// Internal Hook (for useSession & useAuthenticated)
// =============================================================================

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  
  if (!context) {
    throw new Error(
      "useSessionContext must be used within a SessionProvider. " +
      "Please wrap your app with <SessionProvider> in your root layout."
    );
  }
  
  return context;
}
