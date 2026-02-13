import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { withErrorHandler } from "@/lib/api-wrapper"
import { guestRateLimit } from "@/lib/rate-limit"

interface MigrateGuestRequest {
  guestSessionId: string
  userId: string
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Rate limit 체크
  const ip = req.ip ?? "anonymous"
  const { success, reset } = await guestRateLimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: "Daily guest limit exceeded", reset },
      { status: 429 }
    )
  }

  const body: MigrateGuestRequest = await req.json()
  const { guestSessionId, userId } = body

  // 사용자 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // 게스트 퀴즈 결과 마이그레이션
  const guestAttempts = await prisma.guestQuizAttempt.findMany({
    where: { guestId: guestSessionId },
  })

  if (guestAttempts.length === 0) {
    return NextResponse.json(
      { error: "No guest data found" },
      { status: 404 }
    )
  }

  // 트랜잭션으로 데이터 마이그레이션
  const migratedAttempts = await prisma.$transaction(async (tx) => {
    // 1. 게스트 시도를 사용자 시도로 변환
    const newAttempts = await Promise.all(
      guestAttempts.map((attempt) =>
        tx.quizAttempt.create({
          data: {
            userId: user.id,
            quizId: attempt.quizId,
            score: attempt.score,
            answers: attempt.answers,
            completed: true,
            createdAt: attempt.createdAt,
          },
        })
      )
    )

    // 2. 게스트 시도 데이터 삭제
    await tx.guestQuizAttempt.deleteMany({
      where: { guestId: guestSessionId },
    })

    return newAttempts
  })

  return NextResponse.json({
    success: true,
    migratedCount: migratedAttempts.length,
    attempts: migratedAttempts,
  })
})
