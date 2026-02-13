import { createAuthClient } from "better-auth/react"

// 브라우저 환경에서 현재 origin 사용, 서버 환경에서는 환경변수 사용
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // 브라우저에서 실행될 때 현재 페이지의 origin 사용
    return window.location.origin
  }
  // 서버 사이드에서는 환경변수 사용
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

// Better Auth 클라이언트 설정
export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})

// 편의를 위한 낵명된 export
export const { signIn, signUp, signOut, useSession } = authClient

// 세션 상태 확인 유틸리티
export const checkSession = async () => {
  try {
    const session = await authClient.getSession()
    return session.data
  } catch (error) {
    console.error("Session check failed:", error)
    return null
  }
}