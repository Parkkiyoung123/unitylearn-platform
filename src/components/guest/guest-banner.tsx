"use client"

import { useEffect, useState } from "react"
import { getRemainingAttempts, hasGuestData } from "@/lib/guest-session"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function GuestBanner() {
  const [remaining, setRemaining] = useState(5)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    setRemaining(getRemainingAttempts())
    setHasData(hasGuestData())
  }, [])

  if (remaining <= 0) {
    return (
      <Alert variant="destructive">
        <AlertTitle>게스트 한도 도달</AlertTitle>
        <AlertDescription>
          {hasData ? (
            <>
              <p>5문제 체험을 모두 사용했습니다. 더 많은 문제를 풀려면 회원가입하세요!</p>
              <Link href="/auth/signup">
                <Button className="mt-2">회원가입하고 계속하기</Button>
              </Link>
            </>
          ) : (
            <p>5문제 체험을 모두 사용했습니다.</p>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert>
      <AlertTitle>게스트 모드</AlertTitle>
      <AlertDescription>
        남은 체험 횟수
        {hasData && (
          <p className="mt-2 text-sm">
            지금까지 푼 문제 기록이 있습니다. 회원가입 시 자동으로 저장됩니다.
          </p>
        )}
      </AlertDescription>
    </Alert>
  )
}
