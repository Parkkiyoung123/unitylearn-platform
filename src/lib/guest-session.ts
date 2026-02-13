import { GuestSession, GuestQuizResult, GUEST_SESSION_KEY, GUEST_QUIZ_RESULTS_KEY } from "@/types/guest"

const MAX_GUEST_ATTEMPTS = 5

export function createGuestSession(): GuestSession {
  const session: GuestSession = {
    id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    attempts: 0,
    maxAttempts: MAX_GUEST_ATTEMPTS,
    quizResults: [],
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session))
  }

  return session
}

export function getGuestSession(): GuestSession | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(GUEST_SESSION_KEY)
  if (!stored) return null

  try {
    const session: GuestSession = JSON.parse(stored)
    // 날짜 객체 복원
    session.createdAt = new Date(session.createdAt)
    session.quizResults = session.quizResults.map((r: GuestQuizResult) => ({
      ...r,
      completedAt: new Date(r.completedAt),
    }))
    return session
  } catch {
    return null
  }
}

export function setGuestSession(session: GuestSession): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session))
  }
}

export function updateGuestSession(session: GuestSession): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session))
  }
}

export function incrementGuestAttempts(): boolean {
  const session = getGuestSession()
  if (!session) return false

  if (session.attempts >= session.maxAttempts) {
    return false
  }

  session.attempts += 1
  updateGuestSession(session)
  return true
}

export function canGuestAttempt(): boolean {
  const session = getGuestSession()
  if (!session) return true // 세션이 없으면 새로 생성 가능

  return session.attempts < session.maxAttempts
}

export function isGuestLimitReached(): boolean {
  const session = getGuestSession()
  if (!session) return false

  return session.attempts >= session.maxAttempts
}

export function getRemainingAttempts(): number {
  const session = getGuestSession()
  if (!session) return MAX_GUEST_ATTEMPTS

  return Math.max(0, session.maxAttempts - session.attempts)
}

export function saveGuestQuizResult(result: GuestQuizResult): void {
  const session = getGuestSession()
  if (!session) return

  session.quizResults.push(result)
  updateGuestSession(session)
}

export function clearGuestSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_SESSION_KEY)
    localStorage.removeItem(GUEST_QUIZ_RESULTS_KEY)
  }
}

export function hasGuestData(): boolean {
  const session = getGuestSession()
  return session !== null && session.quizResults.length > 0
}
