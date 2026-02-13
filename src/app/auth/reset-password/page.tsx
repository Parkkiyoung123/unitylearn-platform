"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await (authClient as any).forgetPassword({
        email,
        redirectTo: "/auth/reset-password/confirm",
      })
      setIsSent(true)
    } catch (err) {
      setError("비밀번호 재설정 이메일 전송에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">이메일 전송 완료</h1>
          <p className="text-gray-600 mb-6">
            {email}로 비밀번호 재설정 링크를 전송했습니다.
            이메일을 확인하고 링크를 클릭하여 새 비밀번호를 설정하세요.
          </p>
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">비밀번호 재설정</h1>
          <p className="mt-2 text-gray-600">
            가입한 이메일 주소를 입력하시면 재설정 링크를 별내드립니다.
          </p>
        </div>

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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "전송 중..." : "재설정 링크 별내기"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-500">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
