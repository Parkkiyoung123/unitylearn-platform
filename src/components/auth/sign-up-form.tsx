"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.")
      setIsLoading(false)
      return
    }

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      })

      if (result.error) {
        // Better Auth 에러 코드에 따른 구체적인 메시지
        const errorCode = (result.error as any)?.code
        const errorMessage = (result.error as any)?.message
        
        console.error("SignUp Error:", { code: errorCode, message: errorMessage })
        
        switch (errorCode) {
          case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
          case "USER_ALREADY_EXISTS":
            setError("이미 가입된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.")
            break
          case "EMAIL_IS_REQUIRED":
            setError("이메일을 입력해주세요.")
            break
          case "PASSWORD_IS_REQUIRED":
            setError("비밀번호를 입력해주세요.")
            break
          case "NAME_IS_REQUIRED":
            setError("이름을 입력해주세요.")
            break
          case "INVALID_EMAIL":
            setError("올바른 이메일 형식이 아닙니다.")
            break
          case "PASSWORD_TOO_SHORT":
            setError("비밀번호가 너무 짧습니다. 8자 이상 입력해주세요.")
            break
          default:
            setError(errorMessage || "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.")
        }
        setIsLoading(false)
      } else {
        // 회원가입 성공 - 세션 쿠키가 설정됨
        // window.location을 사용하여 완전한 페이지 리로드와 함께 이동
        window.location.href = "/dashboard"
      }
    } catch (err) {
      console.error("SignUp Exception:", err)
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          이름
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="홍길동"
        />
      </div>

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
          placeholder="최소 8자 이상"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="비밀번호를 다시 입력하세요"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "가입 중..." : "회원가입"}
      </button>
    </form>
  )
}
