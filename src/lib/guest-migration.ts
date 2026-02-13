import { getGuestSession, clearGuestSession } from "./guest-session"

export async function migrateGuestData(userId: string): Promise<{
  success: boolean
  migratedCount?: number
  error?: string
}> {
  const session = getGuestSession()

  if (!session || session.quizResults.length === 0) {
    return { success: true, migratedCount: 0 }
  }

  try {
    const response = await fetch("/api/auth/migrate-guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guestSessionId: session.id,
        userId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Migration failed")
    }

    const result = await response.json()

    // 마이그레이션 성공 후 게스트 데이터 삭제
    clearGuestSession()

    return {
      success: true,
      migratedCount: result.migratedCount,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
