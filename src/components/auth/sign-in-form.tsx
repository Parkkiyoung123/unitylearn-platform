"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        // Better Auth 에러 코드에 따른 구체적인 메시지
        const errorCode = (result.error as any)?.code
        
        switch (errorCode) {
          case "INVALID_EMAIL_OR_PASSWORD":
          case "INVALID_CREDENTIALS":
            setError("이메일 또는 비밀번호가 올바르지 않습니다")
            break
          case "EMAIL_NOT_VERIFIED":
            setError("이메일 인증이 필요합니다. 이메일을 확인해주세요.")
            break
          case "USER_NOT_FOUND":
            setError("등록되지 않은 이메일입니다. 회원가입을 진행해주세요.")
            break
          case "ACCOUNT_DISABLED":
            setError("비활성화된 계정입니다. 관리자에게 문의하세요.")
            break
          default:
            setError("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.")
        }
        setIsLoading(false)
      } else {
        // 로그인 성공 - 세션 쿠키가 설정됨
        // window.location을 사용하여 완전한 페이지 리로드와 함께 이동
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error("SignIn Exception:", err)
      setError("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  )
}
