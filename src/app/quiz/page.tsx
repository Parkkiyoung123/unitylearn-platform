"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GuestBanner } from "@/components/guest/guest-banner"
import { getGuestSession, isGuestLimitReached } from "@/lib/guest-session"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function QuizPage() {
  const router = useRouter()
  const [isGuest, setIsGuest] = useState(false)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 5

  useEffect(() => {
    const session = getGuestSession()
    if (session) {
      setIsGuest(true)
      setAttempts(session.attempts)
      setIsLimitReached(isGuestLimitReached())
    }
  }, [])

  if (isLimitReached) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-800 mb-4">게스트 한도 도달</h2>
            <p className="text-red-600 mb-6">
              5문제 체험을 모두 사용했습니다. 더 많은 문제를 풀려면 회원가입하세요!
            </p>
            <Link href="/auth/signup">
              <Button size="lg">회원가입하고 계속하기</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {isGuest && (
          <div className="mb-6">
            <GuestBanner />
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Unity 버그 진단 퀴즈</h1>
          
          {isGuest ? (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{maxAttempts - attempts}/5</span>
              </div>
            </div>
          ) : null}
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">퀴즈가 곧 시작됩니다...</h3>
              <p className="text-gray-600">
                Unity 버그 시나리오를 분석하고 올바른 해결책을 선택하세요.
              </p>
            </div>
            
            <div className="text-center text-gray-400">
              퀴즈 콘텐츠가 여기에 표시됩니다
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
